import "../assets/styles/styles.css";
import "../assets/styles/bootstrap.min.css";

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux"
import { Form, Button } from "react-bootstrap"
import { CircularProgress } from "@mui/material"
import { ethers } from "ethers";
import axios from 'axios';
import { Buffer } from "buffer";
import { create } from "ipfs-http-client";
import MDEditor from '@uiw/react-md-editor';

import Medium from "../artifacts/MediumBlog.sol/MediumBlog.json";
import { contractAddress, networkDeployedTo } from "../utils/contracts-config";
import networksMap from "../utils/networksMap.json";


const ipfsClient = create("https://ipfs.infura.io:5001/api/v0")
const ipfsBaseUrl = "https://ipfs.infura.io/ipfs/"

const EditPost = () => {
    const { id } = useParams()
    let navigate = useNavigate();
    const data = useSelector((state) => state.blockchain.value)

    const [loading, setLoading] = useState(false)
    const [image, setImage] = useState(null)
    const [content, setContent] = useState("")
    const [formInput, setFormInput] = useState({ title: "", overview: "", coverImg: "", readTime: "" })
    const [post, setPost] = useState({ title: "", overview: "", coverImg: "", readTime: "", content: "" })

    const getImage = async (e) => {

        e.preventDefault()
        const reader = new window.FileReader();
        const file = e.target.files[0];

        if (file !== undefined) {
            reader.readAsArrayBuffer(file)

            reader.onloadend = () => {
                const buf = Buffer(reader.result, "base64")
                setImage(buf)
                setFormInput({ ...formInput, coverImg: URL.createObjectURL(file) })
            }
        }
    }

    async function getPostDetails() {
        if (data.network === networksMap[networkDeployedTo]) {
            const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
            const medium = new ethers.Contract(contractAddress, Medium.abi, provider);
            const _post = (await medium.getAllPosts())[Number(id)]
            const metaData = await axios.get(_post[6])

            setPost({
                ...post,
                title: _post[2],
                overview: _post[3],
                coverImg: _post[4],
                readTime: Number(_post[5]),
                contentURI: _post[6],
                content: metaData.data
            })
            setFormInput({
                ...formInput,
                title: _post[2],
                overview: _post[3],
                coverImg: _post[4],
                readTime: Number(_post[5])
            })
            setContent(metaData.data)
        }
    }

    async function edit() {
        if (data.network === networksMap[networkDeployedTo]) {
            const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
            const signer = provider.getSigner()
            const medium = new ethers.Contract(contractAddress, Medium.abi, signer);

            try {
                setLoading(true)
                console.log("a")
                let imageURI;
                if (formInput.coverImg !== post.coverImg) {
                    const addedFile = await ipfsClient.add(image)
                    imageURI = ipfsBaseUrl + addedFile.path
                    console.log("b")
                } else {
                    imageURI = post.coverImg;
                    console.log("c")
                }

                let contentURI;
                if (content !== post.content) {
                    const addedContent = await ipfsClient.add(content)
                    contentURI = ipfsBaseUrl + addedContent.path
                    console.log("d")
                } else {
                    contentURI = post.contentURI;
                    console.log("e")
                }

                const edit_tx = await medium.updatePost(
                    Number(id),
                    formInput.title,
                    formInput.overview,
                    Number(formInput.readTime),
                    imageURI,
                    contentURI
                )
                await edit_tx.wait();

                setImage(null)
                setLoading(false)
                navigate("/post/" + id)
            }
            catch (err) {
                window.alert("An error has occured")
                setLoading(false)
                console.log(err)
            }
        } else {
            window.alert(`Please Switch to the ${networksMap[networkDeployedTo]} network`)
        }
    }

    const onChange = useCallback((value) => {
        setContent(value);
    }, []);


    useEffect(() => {
        if (window.ethereum !== undefined) {
            getPostDetails()
        }
    }, [data.network])


    return (

        <>
            <div className="mainheading" style={{ paddingLeft: "40%" }}>
                <h1 className="sitetitle">Edit Your post</h1>
            </div>

            <div className="container" style={{ textAlign: "left", paddingTop: "4rem", paddingBottom: "4rem" }}>

                <div style={{ width: "500px" }}>
                    <label>Post title : </label>
                    <Form.Control
                        type="text"
                        maxLength={80}
                        onChange={(e) => setFormInput({ ...formInput, title: e.target.value })}
                        value={formInput.title} />
                </div>
                <br />
                <div style={{ width: "500px" }}>
                    <label>Post overview : </label>
                    <Form.Control type="text" as="textarea"
                        rows={4}
                        maxLength={150}
                        onChange={(e) => setFormInput({ ...formInput, overview: e.target.value })}
                        value={formInput.overview} />
                </div>
                <br />
                <div style={{ width: "500px" }}>
                    <label>Post read time (in minutes) : </label>
                    <Form.Control type="Number"
                        onChange={(e) => setFormInput({ ...formInput, readTime: e.target.value })}
                        value={formInput.readTime} />
                </div>
                <br />
                <div>
                    <label>Post content: </label>
                </div>
                <div data-color-mode="light">
                    <MDEditor
                        height={400}
                        value={content}
                        onChange={setContent}
                    />
                </div>
                <br />
                <div style={{ width: "500px" }}>
                    <Form.Control type="file" name="file" onChange={(e) => { getImage(e) }} />
                </div>
                <br />
                {
                    formInput.coverImg && (
                        <div style={{ textAlign: "center" }}>
                            <img className="rounded mt-4" width="350" src={formInput.coverImg} />
                        </div>
                    )
                }
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
