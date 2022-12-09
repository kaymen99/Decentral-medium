<div id="top"></div>

<!-- ABOUT THE PROJECT -->
## Decentral-medium

This a decentralized web3.0 version of the Medium application built on the Ethereum/Polygon network (or any EVM compatible blockchain), users can create posts and save them directly into the blockchain using IPFS.

<p align="center">
  <img alt="Dark" src="https://user-images.githubusercontent.com/83681204/175719913-82469809-5fbc-4f0b-a341-53f30c9f8226.png" width="100%">
</p>


### Built With

* [Solidity](https://docs.soliditylang.org/)
* [Hardhat](https://hardhat.org/getting-started/)
* [React.js](https://reactjs.org/)
* [ethers.js](https://docs.ethers.io/v5/)
* [web3modal](https://github.com/Web3Modal/web3modal)
* [material ui](https://mui.com/getting-started/installation/)


<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
       <li><a href="#prerequisites">Prerequisites</a></li>
       <li><a href="#project-structure">Project structure</a></li>
       <li><a href="#initial-setup">Initial Setup</a></li>
      </ul>
    </li>
    <li>
      <a href="#how-it-works">How it Works</a>
     <ul>
       <li><a href="#contracts">Contracts</a></li>
       <li><a href="#user-interface">User interface</a></li>
      </ul>
    </li>
    <li><a href="#how-to-use">How to Use</a></li>
    <li><a href="#future-developements">Future developements</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#license">License</a></li>
  </ol>
</details>


<!-- GETTING STARTED -->
## Getting Started

### Prerequisites

Please install or have installed the following:
* [nodejs](https://nodejs.org/en/download/) and [yarn](https://classic.yarnpkg.com/en/)
* [MetaMask](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn) Chrome extension installed in your browser
* [Ganache](https://trufflesuite.com/ganache/) for local smart contracts deployement and testing

### Project structure

This a full stack web3 decentralized application built using Hardhat/React js, so the project is devided into 2 main parts:
<ul>
 <li><b>Smart contract/backend side:</b></li>
 Located in the hardhat folder, it contains the blockchain developement envirenment built using Hardhat, with all the smart contracts tests, deployement scripts and the plugins used. 
  <li><b>front-end side:</b></li>
The code for the UI can be found in the src folder (as in all reactjs apps)
</ul>

### Initial Setup
1. Clone the repository and install all the required packages by running:
   ```sh
   git clone https://github.com/kaymen99/Decentral-medium.git
   cd Decentral-medium
   yarn
   ```
2. Private key & Network Urls setup: in the hardhat folder you'll find a .env file, it's used to store all the sensible data/keys like your private key, RPC url for mainnet, rinkeby, kovan... (you get RPC url from services like Infura or Alchemy for free), you can also provide Etherscan api key to allow automatic contracts verifications :
   ```sh
    RINKEBY_ETHERSCAN_API_KEY="your etherscan api key"
    RINKEBY_RPC_URL="https://eth-rinkeby.alchemyapi.io/v2/apiKey"
    POLYGON_RPC_URL="Your polygon RPC url from alchemy or infura"
    MUMBAI_RPC_URL="Your mumbai RPC url from alchemy or infura"
    PRIVATE_KEY="ganahce-private-key"
   ```
* <b>IMPORTANT : </b> For the purpose of testing you can just provide the ganache private key and ignore all the other variables.

3. As infura recently removed its free IPFS storage gateway i used `web3.storage` api for storing data into IPFS, this api is as simple as infura it requires the creation of a free account and a new api token which you can do [here](https://web3.storage), when you finish add your api token into the `src/utils/ipfsStorage.js` file:
   ```js
    const web3storage_key = "YOUR-WEB3.STORAGE-API-TOKEN";
   ```
   
<p align="right">(<a href="#top">back to top</a>)</p>

<!-- Working EXAMPLES -->
## How it Works

### Contracts

The blog is based on the MediumBlog.sol smart contract which contains all the backend logic :

<h4>Core functions:</h4>
<ul>
  <li><b>subscribe:</b> allow any user to subscribe & create a profile in the app for posting articles.</li>
  <li><b>editProfile:</b> enable author to update his profile (username, picture, description).</li>
  <li><b>createPost:</b> once subscribed each user can add it's own posts by providing a title,an overview, main content and the read time</li>
  <li><b>updatePost:</b> author can change the details of previously published posts </li>
  <li><b>tipPostCreator:</b> allow any user to give a tip to a certain post author</li>
</ul>

<h4>Admin functions: (admin is the only one that can call this functions)</h4>
<ul>
  <li><b>changeListingFee:</b> change the fee charged when posting a new article</li>
  <li><b>withdrawBalance:</b> the admin is able to withdraw th contract balance which is accumulated from the charged posting fee</li>
</ul>


### User interface

The app is structered into 4 pages:

* The home page is the landing page of the app, it lists all the published posts (both featured and normal).

![Capture d’écran 2022-06-24 à 21 50 22](https://user-images.githubusercontent.com/83681204/175750937-d4bbbaf2-6d43-4c36-8729-9538c07ab7d3.png)

* Eash author have it's own dashboard where he can find all his previously published posts, and he can add or edit the posts, the dashboard can be accessed from the 'connect' button

![Capture d’écran 2022-06-28 à 22 26 45](https://user-images.githubusercontent.com/83681204/176301443-ade559bc-7898-4498-b61d-384f57f95058.png)

* To be able to create a post the author must first register into the app by providing: username, profile description & picture. The 'register' button can be found in the dashboard page on the first visit.

![Capture d’écran 2022-06-24 à 23 50 17](https://user-images.githubusercontent.com/83681204/175751091-7fbd6341-310b-411b-8353-20b653260534.png)

* For creating a new post the app provide the author a content editor built using the package @uiw/react-md-editor where he can freely design his post, then by providing a title, overview, cover imae and the article read time the author can publish the post while paying a small 'posting fee'. 

![Capture d’écran 2022-06-24 à 21 56 27](https://user-images.githubusercontent.com/83681204/175751246-df4a73f5-4b56-4583-b76f-f475abd3772a.png)

* Each post can be viewed on it's own page, there readers can also choose to give a tip to the author by clicking on the 'give a tip' button which will open a window where the reader can select the tip amount. The author on the other hand can find and 'Edit Post' button which will redirect him to a page where he can modify the post informations (title, content,...).

<table>
  <tr>
    <td valign="top"><img src="https://user-images.githubusercontent.com/83681204/175751412-8a3adda8-5648-4e02-b075-e9a03af37189.png"></td>
    <td valign="top"><img src="https://user-images.githubusercontent.com/83681204/175751552-7d21b151-6f4d-4c7d-8287-d82e1cb97e7a.png"></td>
  </tr>
 </table>

<p align="right">(<a href="#top">back to top</a>)</p>


<!-- USAGE EXAMPLES -->
## How to Use

After going through all the installation and setup steps, you'll need to deploy the smart contract to the ganache network by running: 
   ```sh
   cd hardhat
   npx hardhat run scripts/deploy-script.js --network ganache
   ```
This will create a config.js file and an artifacts folder and transfer them to the src folder to enable the interaction between the contract and the UI

If you want to test the functionnalities of the MediumBlog contract you can do it by running:
   ```sh
   npx hardhat test
   ```
To start the app you have to go back to the Decentral-medium folder and run the command:
   ```sh
   yarn start
   ```
   
<p align="right">(<a href="#top">back to top</a>)</p>

<!-- FUTURE DEVELOPEMENT -->
## Future developements

* Add article search and filter functinnalities.

* Perfom contracts audit using known tools such as echidna & slither.
   
<p align="right">(<a href="#top">back to top</a>)</p>

<!-- Contact -->
## Contact

If you have any question or problem running this project just contact me: aymenMir1001@gmail.com

<p align="right">(<a href="#top">back to top</a>)</p>


<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#top">back to top</a>)</p>

