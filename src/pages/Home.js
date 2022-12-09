import "../assets/styles/styles.css";
import "../assets/styles/bootstrap.min.css";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { ethers } from "ethers";

import { IPFS_GATEWAY } from "./../utils/ipfsStorage";
import Medium from "../artifacts/MediumBlog.sol/MediumBlog.json";
import { contractAddress, networkDeployedTo } from "../utils/contracts-config";
import networksMap from "../utils/networksMap.json";

const Home = () => {
  const data = useSelector((state) => state.blockchain.value);

  const [postsList, SetPostsList] = useState([]);

  async function getPostsList() {
    if (data.network === networksMap[networkDeployedTo]) {
      const provider = new ethers.providers.Web3Provider(
        window.ethereum,
        "any"
      );
      const medium = new ethers.Contract(contractAddress, Medium.abi, provider);
      const posts = await medium.getAllPosts();

      if (posts.length !== 0) {
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
        SetPostsList(items.reverse());
      }
    }
  }

  useEffect(() => {
    if (window.ethereum !== undefined) {
      getPostsList();
    }
  }, [data.network]);

  return (
    <div className="container">
      <div className="mainheading">
        <h1 className="sitetitle">Decentralized Medium</h1>
        <p className="lead">
          Web3.0 app, Medium style, Simply perfect for bloggers
        </p>
      </div>
      {postsList.length !== 0 ? (
        <>
          <section className="featured-posts">
            <div className="section-title">
              <h2>
                <span>Featured</span>
              </h2>
            </div>
            <div className="card-columns listfeaturedtag">
              {postsList.slice(0, 4).map((post, index) => {
                return (
                  <div className="card" key={index}>
                    <div className="row">
                      <div className="col-md-5 wrapthumbnail">
                        <a href={"/post/" + post.id}>
                          <div
                            class="thumbnail"
                            style={{
                              backgroundImage: `url(${post.coverImage})`,
                            }}
                          ></div>
                        </a>
                      </div>
                      <div className="col-md-7">
                        <div className="card-block">
                          <h2 className="card-title">
                            <a href={"/post/" + post.id}>{post.title}</a>
                          </h2>
                          <h4 className="card-text">
                            {`${post.overview.slice(0, 150)}...`}
                          </h4>
                          <div className="metafooter">
                            <div className="wrapfooter">
                              <span className="meta-footer-thumb">
                                <a
                                  href={
                                    "/author-dashboard/" + post.authorAddress
                                  }
                                >
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
                                    href={
                                      "/author-dashboard/" + post.authorAddress
                                    }
                                  >
                                    {post.authorName}
                                  </a>
                                </span>
                                <br />
                                <span className="post-date">
                                  {`  ${post.createdAt.toLocaleString(
                                    "default",
                                    {
                                      day: "2-digit",
                                    }
                                  )} ${post.createdAt.toLocaleString(
                                    "default",
                                    {
                                      month: "long",
                                    }
                                  )} ${post.createdAt.toLocaleString(
                                    "default",
                                    {
                                      year: "numeric",
                                    }
                                  )}  `}
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
                  </div>
                );
              })}
            </div>
          </section>
          <section className="recent-posts">
            <div className="section-title">
              <h2>
                <span>All Stories</span>
              </h2>
            </div>
            <div
              className="card-columns listrecent"
              style={{ textAlign: "left" }}
            >
              {postsList.slice(4).map((post, index) => {
                return (
                  <div className="card" key={index}>
                    <a href={"/post/" + post.id}>
                      <img
                        className="img-fluid img-thumb-1"
                        src={post.coverImage}
                        alt=""
                      />
                    </a>
                    <div className="card-block">
                      <h2 className="card-title">
                        <a href={"/post/" + post.id}>{post.title}</a>
                      </h2>
                      <h4 className="card-text">{post.overview}</h4>
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
                            <a href="/post" title="Read Story">
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
                );
              })}
            </div>
          </section>
        </>
      ) : (
        <div className="container" style={{ paddingTop: "200px" }}>
          No post published yet
          <br />
          <br />
        </div>
      )}
    </div>
  );
};

export default Home;
