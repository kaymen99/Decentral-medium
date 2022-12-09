import "../assets/styles/styles.css";
import "../assets/styles/bootstrap.min.css";

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Form, Button } from "react-bootstrap";
import { CircularProgress } from "@mui/material";
import { ethers } from "ethers";
import axios from "axios";
import MDEditor from "@uiw/react-md-editor";
import { File } from "web3.storage";
import { ipfsSaveContent, IPFS_GATEWAY } from "./../utils/ipfsStorage";

import Medium from "../artifacts/MediumBlog.sol/MediumBlog.json";
import { contractAddress, networkDeployedTo } from "../utils/contracts-config";
import networksMap from "../utils/networksMap.json";

const EditPost = () => {
  const { id } = useParams();
  let navigate = useNavigate();
  const data = useSelector((state) => state.blockchain.value);

  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState({
    name: "",
    file: null,
  });
  const [content, setContent] = useState("");
  const [formInput, setFormInput] = useState({
    title: "",
    overview: "",
    coverImg: "",
    readTime: "",
  });
  const [post, setPost] = useState({
    title: "",
    overview: "",
    coverImg: "",
    readTime: "",
    contentURI: "",
    content: "",
  });

  const getImage = async (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    setImage({
      name: file.name,
      file: file,
    });
    setFormInput({ ...formInput, coverImg: URL.createObjectURL(file) });
  };

  async function getPostDetails() {
    if (data.network === networksMap[networkDeployedTo]) {
      const provider = new ethers.providers.Web3Provider(
        window.ethereum,
        "any"
      );
      const medium = new ethers.Contract(contractAddress, Medium.abi, provider);
      const _post = (await medium.getAllPosts())[Number(id)];

      const imageUrl = _post[4].replace("ipfs://", IPFS_GATEWAY);
      const contentUrl = _post[6].replace("ipfs://", IPFS_GATEWAY);
      let metaData = await axios.get(contentUrl);

      setPost({
        ...post,
        title: _post[2],
        overview: _post[3],
        coverImg: imageUrl,
        readTime: Number(_post[5]),
        contentURI: _post[6],
        content: metaData.data.content,
      });
      setFormInput({
        ...formInput,
        title: _post[2],
        overview: _post[3],
        coverImg: imageUrl,
        readTime: Number(_post[5]),
      });
      setContent(metaData.data.content);
    }
  }

  async function edit() {
    if (data.network === networksMap[networkDeployedTo]) {
      const provider = new ethers.providers.Web3Provider(
        window.ethereum,
        "any"
      );
      const signer = provider.getSigner();
      const medium = new ethers.Contract(contractAddress, Medium.abi, signer);

      try {
        setLoading(true);
        console.log("a");
        let imageURI;
        if (formInput.coverImg !== post.coverImg) {
          const cid = await ipfsSaveContent(image.file);
          imageURI = `ipfs://${cid}/${image.name}`;
        } else {
          imageURI = post.coverImg;
        }

        let contentURI;
        if (content !== post.content) {
          const jsonContent = JSON.stringify({
            content: content,
          });
          const blob = new Blob([jsonContent], {
            type: "application/json",
          });
          const file = new File([blob], "postContent.json");

          const dataCid = await ipfsSaveContent(file);
          contentURI = `ipfs://${dataCid}/postContent.json`;
        } else {
          contentURI = post.contentURI;
        }

        const edit_tx = await medium.updatePost(
          Number(id),
          formInput.title,
          formInput.overview,
          Number(formInput.readTime),
          imageURI,
          contentURI
        );
        await edit_tx.wait();

        setImage({ name: "", file: null });
        setLoading(false);
        navigate("/post/" + id);
      } catch (err) {
        window.alert("An error has occured");
        setLoading(false);
        console.log(err);
      }
    } else {
      window.alert(
        `Please Switch to the ${networksMap[networkDeployedTo]} network`
      );
    }
  }

  useEffect(() => {
    if (window.ethereum !== undefined) {
      getPostDetails();
    }
  }, [data.network]);

  return (
    <>
      <div className="mainheading" style={{ paddingLeft: "40%" }}>
        <h1 className="sitetitle">Edit Your post</h1>
      </div>

      <div
        className="container"
        style={{ textAlign: "left", paddingTop: "4rem", paddingBottom: "4rem" }}
      >
        <div style={{ width: "500px" }}>
          <label>Post title : </label>
          <Form.Control
            type="text"
            maxLength={80}
            onChange={(e) =>
              setFormInput({ ...formInput, title: e.target.value })
            }
            value={formInput.title}
          />
        </div>
        <br />
        <div style={{ width: "500px" }}>
          <label>Post overview : </label>
          <Form.Control
            type="text"
            as="textarea"
            rows={4}
            maxLength={150}
            onChange={(e) =>
              setFormInput({ ...formInput, overview: e.target.value })
            }
            value={formInput.overview}
          />
        </div>
        <br />
        <div style={{ width: "500px" }}>
          <label>Post read time (in minutes) : </label>
          <Form.Control
            type="Number"
            onChange={(e) =>
              setFormInput({ ...formInput, readTime: e.target.value })
            }
            value={formInput.readTime}
          />
        </div>
        <br />
        <div>
          <label>Post content: </label>
        </div>
        <div data-color-mode="light">
          <MDEditor height={400} value={content} onChange={setContent} />
        </div>
        <br />
        <div style={{ width: "500px" }}>
          <Form.Control
            type="file"
            name="file"
            onChange={(e) => {
              getImage(e);
            }}
          />
        </div>
        <br />
        {formInput.coverImg && (
          <div style={{ textAlign: "center" }}>
            <img
              className="rounded mt-4"
              width="350"
              src={formInput.coverImg}
            />
          </div>
        )}
        <br />
        <div className="container" style={{ textAlign: "center" }}>
          <Button onClick={edit} variant="success">
            {loading ? <CircularProgress color="inherit" /> : "Change"}
          </Button>
        </div>
      </div>
    </>
  );
};

export default EditPost;
