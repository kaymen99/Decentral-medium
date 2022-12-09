import "../assets/styles/styles.css";
import "../assets/styles/bootstrap.min.css";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import axios from "axios";
import MDEditor from "@uiw/react-md-editor";
import { Form, Button, Modal } from "react-bootstrap";
import { CircularProgress } from "@mui/material";

import { IPFS_GATEWAY } from "./../utils/ipfsStorage";
import Medium from "../artifacts/MediumBlog.sol/MediumBlog.json";
import { contractAddress, networkDeployedTo } from "../utils/contracts-config";
import networksMap from "../utils/networksMap.json";

const Post = () => {
  const { id } = useParams();
  const data = useSelector((state) => state.blockchain.value);

  const [loading, setLoading] = useState(false);
  const [tipAmount, setTipAmount] = useState(0);
  const [recentPosts, setRecentPosts] = useState([]);
  const [post, setPost] = useState({
    authorAddress: "",
    authorName: "",
    authorDesc: "",
    authorImg: "",
    title: "",
    content: "",
    coverImg: "",
    readTime: 0,
    createdAt: "",
  });

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  async function getPostDetails() {
    if (data.network === networksMap[networkDeployedTo]) {
      const provider = new ethers.providers.Web3Provider(
        window.ethereum,
        "any"
      );
      const medium = new ethers.Contract(contractAddress, Medium.abi, provider);
      const _post = (await medium.getAllPosts())[Number(id)];

      const authorDetails = await medium.getAuthorDetails(_post[1]);

      const imageUrl = _post[4].replace("ipfs://", IPFS_GATEWAY);
      const profileUrl = authorDetails[3].replace("ipfs://", IPFS_GATEWAY);

      const contentUrl = _post[6].replace("ipfs://", IPFS_GATEWAY);
      let metaData = await axios.get(contentUrl);

      if (authorDetails !== undefined) {
        setPost({
          ...post,
          id: Number(_post[0]),
          authorAddress: _post[1],
          authorName: authorDetails[1],
          authorDesc: authorDetails[2],
          authorImg: profileUrl,
          title: _post[2],
          coverImg: imageUrl,
          readTime: Number(_post[5]),
          content: metaData.data.content,
          createdAt: new Date(Number(_post[7]) * 1000),
        });
      }
    }
  }

  async function getRecentPostsList() {
    if (data.network === networksMap[networkDeployedTo]) {
      const provider = new ethers.providers.Web3Provider(
        window.ethereum,
        "any"
      );
      const medium = new ethers.Contract(contractAddress, Medium.abi, provider);
      const posts = await medium.getAllPosts();

      if (posts !== undefined) {
        const items = await Promise.all(
          posts.map(async (p) => {
            const author = await medium.getAuthorDetails(p[1]);

            const profileUrl = author[3].replace("ipfs://", IPFS_GATEWAY);
            const imageUrl = p[4].replace("ipfs://", IPFS_GATEWAY);

            const item = {
              id: Number(p[0]),
              authorAddress: p[1],
              authorName: author[1],
              authorProfileImg: profileUrl,
              title: p[2],
              overview: p[3],
              coverImage: imageUrl,
              readTime: Number(p[5]),
              createdAt: new Date(Number(p[7]) * 1000),
            };
            return item;
          })
        );
        setRecentPosts(items.reverse());
      }
    }
  }

  async function giveAtip() {
    if (data.network === networksMap[networkDeployedTo]) {
      const provider = new ethers.providers.Web3Provider(
        window.ethereum,
        "any"
      );
      const signer = provider.getSigner();
      const medium = new ethers.Contract(contractAddress, Medium.abi, signer);
      try {
        setLoading(true);

        const tip_tx = await medium.tipPostCreator(Number(id), {
          value: ethers.utils.parseEther(tipAmount.toString(), "ether"),
        });
        await tip_tx.wait();

        setTipAmount(0);
        setShow(false);
        setLoading(false);
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
      getRecentPostsList();
    }
  }, [data.network]);

  return (
    <>
      <div className="container">
        <div className="row">
          <div className="col-md-2 col-xs-12">
            <div className="share">
              <p>Share</p>
              <ul>
                <li>
                  <a target="_blank" href="https://github.com/Aymen1001">
                    <svg
                      className="svgIcon-use"
                      width="29"
                      height="29"
                      viewBox="0 0 29 29"
                    >
                      <path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 6c-3.313 0-6 2.686-6 6 0 2.651 1.719 4.9 4.104 5.693.3.056.396-.13.396-.289v-1.117c-1.669.363-2.017-.707-2.017-.707-.272-.693-.666-.878-.666-.878-.544-.373.041-.365.041-.365.603.042.92.619.92.619.535.917 1.403.652 1.746.499.054-.388.209-.652.381-.802-1.333-.152-2.733-.667-2.733-2.965 0-.655.234-1.19.618-1.61-.062-.153-.268-.764.058-1.59 0 0 .504-.161 1.65.615.479-.133.992-.199 1.502-.202.51.002 1.023.069 1.503.202 1.146-.776 1.648-.615 1.648-.615.327.826.121 1.437.06 1.588.385.42.617.955.617 1.61 0 2.305-1.404 2.812-2.74 2.96.216.186.412.551.412 1.111v1.646c0 .16.096.347.4.288 2.383-.793 4.1-3.041 4.1-5.691 0-3.314-2.687-6-6-6z"></path>
                    </svg>
                  </a>
                </li>
              </ul>
              <div className="sep"></div>
              <p>Talk</p>
              <ul>
                <li>
                  <a href="#comments">
                    42
                    <br />
                    <svg
                      className="svgIcon-use"
                      width="29"
                      height="29"
                      viewBox="0 0 29 29"
                    >
                      <path d="M21.27 20.058c1.89-1.826 2.754-4.17 2.754-6.674C24.024 8.21 19.67 4 14.1 4 8.53 4 4 8.21 4 13.384c0 5.175 4.53 9.385 10.1 9.385 1.007 0 2-.14 2.95-.41.285.25.592.49.918.7 1.306.87 2.716 1.31 4.19 1.31.276-.01.494-.14.6-.36a.625.625 0 0 0-.052-.65c-.61-.84-1.042-1.71-1.282-2.58a5.417 5.417 0 0 1-.154-.75zm-3.85 1.324l-.083-.28-.388.12a9.72 9.72 0 0 1-2.85.424c-4.96 0-8.99-3.706-8.99-8.262 0-4.556 4.03-8.263 8.99-8.263 4.95 0 8.77 3.71 8.77 8.27 0 2.25-.75 4.35-2.5 5.92l-.24.21v.32c0 .07 0 .19.02.37.03.29.1.6.19.92.19.7.49 1.4.89 2.08-.93-.14-1.83-.49-2.67-1.06-.34-.22-.88-.48-1.16-.74z"></path>
                    </svg>
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="col-md-8 col-md-offset-2 col-xs-12">
            <div className="mainheading">
              <div className="row post-top-meta">
                <div className="col-md-2">
                  <a href={"/author-dashboard/" + post.authorAddress}>
                    <img
                      className="author-thumb"
                      src={post.authorImg}
                      alt="Sal"
                    />
                  </a>
                </div>
                <div className="col-md-10">
                  <a
                    className="link-dark"
                    href={"/author-dashboard/" + post.authorAddress}
                  >
                    {post.authorName}
                  </a>

                  {data.account !== post.authorAddress ? (
                    <>
                      <a onClick={handleShow} className="btn follow">
                        Give a tip
                      </a>
                      <Modal show={show} onHide={handleClose}>
                        <Modal.Header closeButton>
                          <Modal.Title>Tip the post creator</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                          <Form.Group className="mb-3">
                            <Form.Label>Tip Amount:</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Enter your tip in ETH"
                              required
                              onChange={(e) => {
                                setTipAmount(e.target.value);
                              }}
                            />
                          </Form.Group>
                        </Modal.Body>
                        <Modal.Footer>
                          <Button variant="secondary" onClick={handleClose}>
                            Close
                          </Button>
                          <Button
                            variant="primary"
                            type="submit"
                            onClick={() => {
                              giveAtip();
                            }}
                          >
                            {loading ? (
                              <CircularProgress color="inherit" />
                            ) : (
                              "Go"
                            )}
                          </Button>
                        </Modal.Footer>
                      </Modal>
                    </>
                  ) : (
                    <a href={"/edit-post/" + post.id} className="btn follow">
                      Edit Post
                    </a>
                  )}
                  <br />
                  <span className="author-description">{post.authorDesc}</span>
                  <br />
                  <span className="post-date">
                    {`  ${post.createdAt.toLocaleString("default", {
                      day: "2-digit",
                    })} ${post.createdAt.toLocaleString("default", {
                      month: "long",
                    })} ${post.createdAt.toLocaleString("default", {
                      year: "numeric",
                    })}  `}
                  </span>
                  <span className="dot"></span>
                  <span className="post-read">{post.readTime} min read</span>
                </div>
              </div>

              <h1 className="posttitle">{post.title}</h1>
            </div>

            <img
              className="featured-image img-fluid"
              src={post.coverImg}
              alt=""
            />

            <div className="article-post" data-color-mode="light">
              <MDEditor.Markdown
                source={post.content}
                style={{ whiteSpace: "pre-wrap" }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="hideshare"></div>

      <div className="graybg">
        <div className="container">
          <div className="section-title">
            <h2>
              <span>Recent Posts</span>
            </h2>
          </div>
          <div className="row listrecent listrelated">
            {recentPosts.slice(0, 3).map((post, index) => {
              return (
                <div className="col-md-4" key={index}>
                  <div className="card">
                    <a href={"/post/" + post.id}>
                      <img
                        className="img-fluid img-thumb-1"
                        src={post.coverImage}
                        alt=""
                      />
                    </a>
                    <div className="card-block" style={{ textAlign: "left" }}>
                      <h2 className="card-title">
                        <a href={"/post/" + post.id}>{post.title}</a>
                      </h2>
                      <div className="metafooter">
                        <div className="wrapfooter">
                          <span className="meta-footer-thumb">
                            <a href={"/author-dashboard/" + post.authorAddress}>
                              <img
                                className="author-thumb"
                                src={post.authorProfileImg}
                                alt="Sal"
                              />
                            </a>
                          </span>
                          <span className="author-meta">
                            <span className="post-name">
                              <a
                                href={"/author-dashboard/" + post.authorAddress}
                              >
                                {post.authorName}
                              </a>
                            </span>
                            <br />
                            <span className="post-date">
                              {`  ${post.createdAt.toLocaleString("default", {
                                day: "2-digit",
                              })} ${post.createdAt.toLocaleString("default", {
                                month: "long",
                              })} ${post.createdAt.toLocaleString("default", {
                                year: "numeric",
                              })}  `}
                            </span>
                            <span className="dot"></span>
                            <span className="post-read">
                              {post.readTime} min read
                            </span>
                          </span>
                          <span className="post-read-more">
                            <a href={"/post/" + post.id} title="Read Story">
                              <svg
                                className="svgIcon-use"
                                width="25"
                                height="25"
                                viewBox="0 0 25 25"
                              >
                                <path
                                  d="M19 6c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v14.66h.012c.01.103.045.204.12.285a.5.5 0 0 0 .706.03L12.5 16.85l5.662 4.126a.508.508 0 0 0 .708-.03.5.5 0 0 0 .118-.285H19V6zm-6.838 9.97L7 19.636V6c0-.55.45-1 1-1h9c.55 0 1 .45 1 1v13.637l-5.162-3.668a.49.49 0 0 0-.676 0z"
                                  fillRule="evenodd"
                                ></path>
                              </svg>
                            </a>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default Post;
