import "../assets/styles/styles.css";
import "../assets/styles/bootstrap.min.css";

import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom'
import { useSelector } from "react-redux"
import { ethers } from "ethers";
import { Buffer } from "buffer";
import { create } from "ipfs-http-client";
import { Button, Form, Modal } from "react-bootstrap";
import { CircularProgress } from "@mui/material";

import Medium from "../artifacts/contracts/MediumBlog.sol/MediumBlog.json";
import { contractAddress, networkDeployedTo } from "../utils/contracts-config";
import networksMap from "../utils/networksMap.json";

const ipfsClient = create("https://ipfs.infura.io:5001/api/v0")
const ipfsBaseUrl = "https://ipfs.infura.io/ipfs/"

const AuthorDashboard = () => {
    const { author } = useParams()
    const data = useSelector((state) => state.blockchain.value)

    const [authorPostsList, setAuthorPostsList] = useState([])
    const [authorProfile, setAuthorProfile] = useState({ username: "", desciption: "", imageUrl: "", subscribed: false })
    const [formInput, setFormInput] = useState({ username: "", desciption: "", imageUrl: "" })

    const [loading, setLoading] = useState(false)
    const [show, setShow] = useState(false);

    const [image, setImage] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const getImage = async (e) => {
        e.preventDefault()
        const reader = new window.FileReader();
        const file = e.target.files[0];

        if (file !== undefined) {
            reader.readAsArrayBuffer(file)

            reader.onloadend = () => {
                const buf = Buffer(reader.result, "base64")
                setImage(buf)
                setImagePreview(file)
            }
        }
    }

    async function getAuthorProfileAndPosts() {
        if (data.network === networksMap[networkDeployedTo]) {
            const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
            const medium = new ethers.Contract(contractAddress, Medium.abi, provider);
            const allPosts = await medium.getAllPosts()

            const authorDetails = await medium.getAuthorDetails(author)
            if (authorDetails !== undefined) {
                setAuthorProfile({ username: authorDetails[1], desciption: authorDetails[2], imageUrl: authorDetails[3], subscribed: authorDetails[4] })
            }

            if (authorDetails[4]) {
                const authorPosts = allPosts.filter((post) => post[1] == author)
                if (authorPosts !== undefined) {
                    const items = authorPosts.map(p => {
                        const item = {
                            id: Number(p[0]),
                            title: p[2],
                            overview: p[3],
                            coverImage: p[4],
                            readTime: Number(p[5]),
                            createdAt: new Date(Number(p[7]) * 1000)
                        }
                        return item
                    })
                    setAuthorPostsList(items.reverse())
                }
            }
        }
    }

    async function subscribe() {
        if (data.network === networksMap[networkDeployedTo]) {
            const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
            const signer = provider.getSigner()
            const medium = new ethers.Contract(contractAddress, Medium.abi, signer);
            if (image !== undefined) {
                try {
                    setLoading(true)

                    const addedFile = await ipfsClient.add(image)
                    const imageURI = ipfsBaseUrl + addedFile.path

                    const register_tx = await medium.subscribe(
                        formInput.username,
                        formInput.desciption,
                        imageURI
                    )
                    await register_tx.wait();

                    setShow(false)
                    setImage(null)
                    setLoading(false)
                    window.location.reload();
                }
                catch (err) {
                    window.alert("An error has occured")
                    setLoading(false)
                    console.log(err)
                }
            }
        } else {
            window.alert(`Please Switch to the ${networksMap[networkDeployedTo]} network`)
        }
    }


    useEffect(() => {
        if (window.ethereum !== undefined) {
            getAuthorProfileAndPosts()
        }
    }, [data.network])


    return (
        <>
            {authorProfile.subscribed ? (
                <>
                    <div className="container">
                        <div className="row">
                            <div className="col-md-2"></div>
                            <div className="col-md-8 col-md-offset-2">
                                <div className="mainheading">
                                    <div className="row post-top-meta authorpage">
                                        <div className="col-md-10 col-xs-12">
                                            <h1>{authorProfile.username}</h1>
                                            <span className="author-description">{authorProfile.desciption}</span>
                                            <br />
                                            {data.account === author ? (
                                                <a href="/create-post" className="btn follow">Add New Post</a>
                                            ) : null}

                                        </div>
                                        <div className="col-md-2 col-xs-12">
                                            <img className="author-thumb" src={authorProfile.imageUrl} alt="profile-picture" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="graybg authorpage">
                        <div className="container">
                            <div className="listrecent listrelated">

                                {authorPostsList.length !== 0 ? (
                                    authorPostsList.map(post => {
                                        return (
                                            <div className="authorpostbox">
                                                <div className="card">
                                                    <a href={"/post/" + post.id}>
                                                        <img className="img-fluid img-thumb" src={post.coverImage} alt="" />
                                                    </a>
                                                    <div className="card-block">
                                                        <h2 className="card-title">
                                                            <a href={"/post/" + post.id}>{post.title}</a>
                                                        </h2>
                                                        <h4 className="card-text">{post.overview}</h4>
                                                        <div className="metafooter">
                                                            <div className="wrapfooter">
                                                                <span className="meta-footer-thumb">
                                                                    <a href={"/author-dashboard/" + author}><img className="author-thumb" src={authorProfile.imageUrl} alt="Sal" /></a>
                                                                </span>
                                                                <span className="author-meta">
                                                                    <span className="post-name"><a href={"/author-dashboard/" + author}>{authorProfile.username}</a></span><br />
                                                                    <span className="post-date">
                                                                        {`  ${post.createdAt.toLocaleString("default", {
                                                                            day: "2-digit",
                                                                        })} ${post.createdAt.toLocaleString("default", {
                                                                            month: "long",
                                                                        })} ${post.createdAt.toLocaleString("default", {
                                                                            year: "numeric",
                                                                        })}  `}
                                                                    </span><span className="dot"></span><span className="post-read">{post.readTime} min read</span>
                                                                </span>
                                                                <span className="post-read-more"><a href={"/post/" + post.id} title="Read Story"><svg className="svgIcon-use" width="25" height="25" viewbox="0 0 25 25"><path d="M19 6c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v14.66h.012c.01.103.045.204.12.285a.5.5 0 0 0 .706.03L12.5 16.85l5.662 4.126a.508.508 0 0 0 .708-.03.5.5 0 0 0 .118-.285H19V6zm-6.838 9.97L7 19.636V6c0-.55.45-1 1-1h9c.55 0 1 .45 1 1v13.637l-5.162-3.668a.49.49 0 0 0-.676 0z" fill-rule="evenodd"></path></svg></a></span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })) : (
                                    <div style={{ textAlign: "center" }}>
                                        <p>You don't have any post yet</p>
                                    </div>
                                )
                                }
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="container" style={{ paddingTop: "200px" }}>
                    Want to create a post, Subscribe first!!!
                    <br />
                    <br />
                    <Button variant="primary" onClick={handleShow}>
                        Register
                    </Button>

                    <Modal show={show} onHide={handleClose}>
                        <Modal.Header closeButton>
                            <Modal.Title>Subscribe to our Blog</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form.Group className="mb-3">
                                <Form.Label>Username:</Form.Label>
                                <Form.Control type="text"
                                    placeholder="Enter your username"
                                    required
                                    onChange={(e) => { setFormInput({ ...formInput, username: e.target.value }) }} />
                            </Form.Group>
                            <div>
                                <label>Profile description: </label>
                                <Form.Control as="textarea"
                                    rows={4}
                                    maxLength={150}
                                    placeholder="Talk a little bit about yourself..."
                                    required
                                    onChange={(e) => { setFormInput({ ...formInput, desciption: e.target.value }) }} />
                            </div>
                            <br />
                            <Form.Group className="mb-3">
                                <Form.Label>Profile picture: </Form.Label>
                                <Form.Control type="file"
                                    required
                                    onChange={(e) => { getImage(e) }} />
                            </Form.Group>
                            <br />
                            {
                                imagePreview && (
                                    <div style={{ textAlign: "center" }}>
                                        <img className="rounded-circle" width="220" height="200" src={URL.createObjectURL(imagePreview)} />
                                    </div>
                                )
                            }
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleClose}>
                                Close
                            </Button>
                            <Button variant="primary"
                                type='submit'
                                onClick={() => { subscribe() }}>
                                {loading ? <CircularProgress color="inherit" /> : "Register"}
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </div>
            )}
        </>
    );
};

export default AuthorDashboard;