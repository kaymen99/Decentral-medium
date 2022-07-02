const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");
const { getAmountInWei, getAmountFromWei } = require('../utils/helper-scripts');

describe("MediumBlog.sol", () => {
  let contract;
  let admin;
  let postingFee = getAmountInWei(0.001);

  const testPostTitle = "Full stack solidity dapp development";
  const testPostOverview = "Create full stack decentrelized apps with hardhat & React";
  const testPostCoverImageURL = "https://testipfsimageurl";
  const testPostContentURI = "https://test-ipfs-content-hash-url";
  const testReadTimeInMinutes = 10 // 10 min


  beforeEach(async () => {
    [admin, user1, user2] = await ethers.getSigners()

    // Deploy MediumBlog contract 
    const contractFactory = await ethers.getContractFactory("MediumBlog");
    contract = await contractFactory.deploy(postingFee);
  });

  describe("Correct Deployement", () => {
    it("should have correct admin address", async () => {
      const contractAdmin = await contract.admin();
      const adminAddress = await admin.getAddress();
      expect(contractAdmin).to.equal(adminAddress);
    });

    it("should have correct posting fee", async () => {
      const fee = await contract.postingFee();
      expect(fee).to.equal(postingFee);
    });
  });

  describe("Core Functions", () => {
    it("should allow user to subscribe the blog", async () => {

      await contract.connect(user1).subscribe(
        "author username",
        "author description",
        "https://author-profile-image-url"
      )

      const author = await contract.getAuthorDetails(user1.address);
      const authorsCount = await contract.authorsCount()

      expect(authorsCount).to.equal(1);
      expect(author[0]).to.equal(0);
      expect(author[1]).to.equal("author username");
      expect(author[2]).to.equal("author description");
      expect(author[3]).to.equal("https://author-profile-image-url");
      expect(author[4]).to.equal(true);
    });

    it("should allow author to edit his profile", async () => {

      await contract.connect(user1).subscribe(
        "author username",
        "author description",
        "https://author-profile-image-url"
      )

      await contract.connect(user1).editProfile(
        "new author username",
        "new author description",
        "https://new-author-profile-image-url"
      )

      const author = await contract.getAuthorDetails(user1.address);
      const authorsCount = await contract.authorsCount()

      expect(authorsCount).to.equal(1);
      expect(author[0]).to.equal(0);
      expect(author[1]).to.equal("new author username");
      expect(author[2]).to.equal("new author description");
      expect(author[3]).to.equal("https://new-author-profile-image-url");
      expect(author[4]).to.equal(true);
    });

    it("should allow user to create new post", async () => {

      await contract.connect(user1).subscribe(
        "author username",
        "author description",
        "https://author-profile-image-url"
      )

      await contract.connect(user1).createPost(
        testPostTitle,
        testPostOverview,
        testPostCoverImageURL,
        testReadTimeInMinutes,
        testPostContentURI,
        { value: postingFee }
      )

      const postCreatedAt = Math.floor(new Date().getTime() / 1000)

      const postId = 0
      const postsList = await contract.getAllPosts();
      const userPost = postsList[postId]

      const provider = waffle.provider
      const contractBalance = await provider.getBalance(contract.address);

      // check contract balance
      expect(contractBalance).to.equal(postingFee)
      // check if correct post is created
      expect(postsList.length).to.equal(1);
      expect(userPost[0]).to.equal(postId);
      expect(userPost[1]).to.equal(user1.address);
      expect(userPost[2]).to.equal(testPostTitle);
      expect(userPost[3]).to.equal(testPostOverview);
      expect(userPost[4]).to.equal(testPostCoverImageURL);
      expect(Number(userPost[5])).to.greaterThanOrEqual(testReadTimeInMinutes);
      expect(userPost[6]).to.equal(testPostContentURI);
      expect(Number(userPost[7])).to.greaterThanOrEqual(postCreatedAt);
    });

    it("should allow user to edit an existing post", async () => {

      await contract.connect(user1).subscribe(
        "author username",
        "author description",
        "https://author-profile-image-url"
      )

      await contract.connect(user1).createPost(
        testPostTitle,
        testPostOverview,
        testPostCoverImageURL,
        testReadTimeInMinutes,
        testPostContentURI,
        { value: postingFee }
      )

      const postId = 0
      await contract.connect(user1).updatePost(
        postId,
        "New post title",
        "New post Overview",
        5,
        "New Post cover image url",
        testPostContentURI
      )
      const postUpdatedAt = Math.floor(new Date().getTime() / 1000)

      const postsList = await contract.getAllPosts();
      const userPost = postsList[postId]

      // check if the post is correctly updated
      expect(postsList.length).to.equal(1);
      expect(userPost[0]).to.equal(postId);
      expect(userPost[1]).to.equal(user1.address);
      expect(userPost[2]).to.equal("New post title");
      expect(userPost[3]).to.equal("New post Overview");
      expect(userPost[4]).to.equal("New Post cover image url");
      expect(userPost[5]).to.equal(5);
      expect(userPost[6]).to.equal(testPostContentURI);
      expect(Number(userPost[7])).to.greaterThanOrEqual(postUpdatedAt);
    });

    it("should allow user to tip a post author", async () => {

      await contract.connect(user1).subscribe(
        "author username",
        "author description",
        "https://author-profile-image-url"
      )

      await contract.connect(user1).createPost(
        testPostTitle,
        testPostOverview,
        testPostCoverImageURL,
        testReadTimeInMinutes,
        testPostContentURI,
        { value: postingFee }
      )

      const postId = 0
      const tipInETH = getAmountInWei(0.001)
      const initialUser1Balance = await user1.getBalance()
      await contract.connect(user2).tipPostCreator(
        postId,
        { "value": tipInETH }
      )
      const finalUser1Balance = await user1.getBalance()
      expect(
        parseFloat(getAmountFromWei(finalUser1Balance))
      ).to.equal(
        parseFloat(getAmountFromWei(initialUser1Balance)) + parseFloat(getAmountFromWei(tipInETH))
      )
    });

    it("should fail creating post by must pay exact posting fee", async () => {
      await contract.connect(user1).subscribe(
        "author username",
        "author description",
        "https://author-profile-image-url"
      )

      const wrongPostingFee = getAmountInWei(0.0001);

      await expect(
        contract.connect(user1).createPost(
          testPostTitle,
          testPostOverview,
          testPostCoverImageURL,
          testReadTimeInMinutes,
          testPostContentURI,
          { value: wrongPostingFee }
        )
      ).to.be.revertedWith("must pay exact posting fee")

    });

    it("should fail creating post by must subscribe first", async () => {

      await expect(
        contract.connect(user1).createPost(
          testPostTitle,
          testPostOverview,
          testPostCoverImageURL,
          testReadTimeInMinutes,
          testPostContentURI,
          { value: postingFee }
        )
      ).to.be.revertedWith("Must subscribe first")

    });

    it("should fail editing post by only post creator", async () => {

      await contract.connect(user1).subscribe(
        "author username",
        "author description",
        "https://author-profile-image-url"
      )

      await contract.connect(user1).createPost(
        testPostTitle,
        testPostOverview,
        testPostCoverImageURL,
        testReadTimeInMinutes,
        testPostContentURI,
        { value: postingFee }
      )
      const postId = 0

      await expect(
        contract.connect(user2).updatePost(
          postId,
          "New post title",
          "New post Overview",
          5,
          "New Post cover image url",
          testPostContentURI)
      ).to.be.revertedWith("only post creator")

    });
  });

  describe('Admin Functions', () => {
    it("it should allow admin to change posting fee", async () => {
      const newPostingFee = getAmountInWei(0.005)
      await contract.connect(admin).changePostingFee(newPostingFee)
      const fee = await contract.postingFee()

      expect(fee).to.equal(newPostingFee)
    });

    it("it should transfer contract balance to admin", async () => {

      await contract.connect(user1).subscribe(
        "author username",
        "author description",
        "https://author-profile-image-url"
      )

      await contract.connect(user1).createPost(
        testPostTitle,
        testPostOverview,
        testPostCoverImageURL,
        testReadTimeInMinutes,
        testPostContentURI,
        { value: postingFee }
      )
      const previousAdminBalance = await admin.getBalance()
      await contract.connect(admin).withdrawBalance()
      const finalAdminBalance = await admin.getBalance()
      const expectedBalance = Number(previousAdminBalance) / 10 ** 18 + Number(postingFee) / 10 ** 18

      // use only 3 decimals because the withdraw transaction cost some gas
      // so admin previous balance is not the same
      expect(
        parseFloat(getAmountFromWei(finalAdminBalance)).toFixed(3)
      ).to.equal(
        parseFloat(Number(expectedBalance)).toFixed(3)
      )
    });
  })
});



