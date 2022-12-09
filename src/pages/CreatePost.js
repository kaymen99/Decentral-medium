import "../assets/styles/styles.css";
import "../assets/styles/bootstrap.min.css";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Form, Button } from "react-bootstrap";
import { CircularProgress } from "@mui/material";
import { ethers } from "ethers";
import MDEditor from "@uiw/react-md-editor";
import { File } from "web3.storage";
import { ipfsSaveContent } from "./../utils/ipfsStorage";

import Medium from "../artifacts/MediumBlog.sol/MediumBlog.json";
import { contractAddress, networkDeployedTo } from "../utils/contracts-config";
import networksMap from "../utils/networksMap.json";

const CreatePost = () => {
  let navigate = useNavigate();
  const data = useSelector((state) => state.blockchain.value);

  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState({
    name: "",
    file: null,
  });
  const [post, setPost] = useState({ title: "", overview: "", readTime: "" });
  const [content, setContent] = useState("");

  const getImage = async (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    setImage({
      name: file.name,
      file: file,
    });
  };

  async function create() {
    if (data.network === networksMap[networkDeployedTo]) {
      const provider = new ethers.providers.Web3Provider(
        window.ethereum,
        "any"
      );
      const signer = provider.getSigner();
      const medium = new ethers.Contract(contractAddress, Medium.abi, signer);
      console.log(post);
      if (image.file !== undefined) {
        try {
          setLoading(true);

          const cid = await ipfsSaveContent(image.file);
          const imageURI = `ipfs://${cid}/${image.name}`;

          const jsonContent = JSON.stringify({
            content: content,
          });

          const blob = new Blob([jsonContent], {
            type: "application/json",
          });

          const file = new File([blob], "postContent.json");

          const dataCid = await ipfsSaveContent(file);
          const contentURI = `ipfs://${dataCid}/postContent.json`;

          const postingFee = await medium.callStatic.postingFee();

          const create_tx = await medium.createPost(
            post.title,
            post.overview,
            imageURI,
            Number(post.readTime),
            contentURI,
            { value: postingFee }
          );
          await create_tx.wait();

          setImage({ name: "", file: null });
          setLoading(false);
          navigate("/author-dashboard/" + data.account);
        } catch (err) {
          window.alert("An error has occured");
          setLoading(false);
          console.log(err);
        }
      }
    } else {
      window.alert(
        `Please Switch to the ${networksMap[networkDeployedTo]} network`
      );
    }
  }

  return (
    <>
      <div className="mainheading" style={{ paddingLeft: "40%" }}>
        <h1 className="sitetitle">Create a new post</h1>
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
            onChange={(e) => setPost({ ...post, title: e.target.value })}
            placeholder="Give it a title ..."
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
            onChange={(e) => setPost({ ...post, overview: e.target.value })}
            placeholder="Post short overview (less than 150 caracteres)"
          />
        </div>
        <br />
        <div style={{ width: "500px" }}>
          <label>Post read time (in minutes) : </label>
          <Form.Control
            type="Number"
            onChange={(e) => setPost({ ...post, readTime: e.target.value })}
            placeholder="Enter post read time"
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
        {image.file && (
          <div style={{ textAlign: "center" }}>
            <img
              className="rounded mt-4"
              width="350"
              src={URL.createObjectURL(image.file)}
            />
          </div>
        )}
        <br />
        <div className="container" style={{ textAlign: "center" }}>
          <Button onClick={create} variant="success">
            {loading ? <CircularProgress color="inherit" /> : "Publish"}
          </Button>
        </div>
      </div>
    </>
  );
};

export default CreatePost;
