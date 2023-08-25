import Navbar from "./Navbar";
import { useState } from "react";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../pinata";
import Marketplace from '../Marketplace.json';
import { useLocation } from "react-router";
import bgform from '../formdes.jpeg';

export default function SellNFT() {
  const [formParams, updateFormParams] = useState({ name: '', description: '', price: '' });
  const [fileURL, setFileURL] = useState(null);
  const ethers = require("ethers");
  const [message, updateMessage] = useState('');
  const location = useLocation();

  async function onChangeFile(e) {
    var file = e.target.files[0];

    try {
      const response = await uploadFileToIPFS(file);
      if (response.success === true) {
        console.log("Uploaded to Pinata:", response.pinataURL);
        setFileURL(response.pinataURL);
      }
    } catch (e) {
      console.log("error uploading the file", e);
    }
  }

  async function listNFT(e) {
    e.preventDefault();

    try {
      if (!fileURL) {
        throw new Error("Please upload an image.");
      }

      const metadataURL = await uploadMetadataToIPFS();

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      updateMessage("Please wait... up to 5 mins");

      let contract = new ethers.Contract(Marketplace.address, Marketplace.abi, signer);
      const price = ethers.utils.parseUnits(formParams.price, 'ether');
      let listingPrice = await contract.getListPrice();
      listingPrice = listingPrice.toString();

      let transaction = await contract.createToken(metadataURL, price, { value: listingPrice });
      await transaction.wait();

      alert("Successfully listed your NFT.");
      updateMessage("");
      updateFormParams({ name: '', description: '', price: '' });
      window.location.replace("/");
    } catch (e) {
      alert('Upload error: ' + e.message);
    }
  }

  async function uploadMetadataToIPFS() {
    const { name, description, price } = formParams;
    if (!name || !description || !price || !fileURL) {
      throw new Error("Missing form data or file URL");
    }

    const nftJSON = {
      name, description, price, image: fileURL
    };

    try {
      const response = await uploadJSONToIPFS(nftJSON);
      if (response.success === true) {
        console.log("Uplaoded JSON to Pinata", response.pinataURL);
        return response.pinataURL;
      }
    } catch (e) {
      console.log("error uploading JSON metadata", e);
      throw e;
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="flex items-center justify-center">
        <div className="w-1/2 p-8 m-6">
          <h3 className="text-2xl font-bold text-green-500 mb-6 text-center">Upload your NFT to the marketplace</h3>
          <form className="space-y-4">
            <div>
              <label className="block text-green-500 text-sm font-bold mb-2" htmlFor="name">NFT Name</label>
              <input className="w-full px-3 py-2 placeholder-gray-300 border rounded-md focus:ring focus:ring-green-200 focus:outline-none focus:border-purple-500" id="name" type="text" placeholder="Axie#4563" onChange={e => updateFormParams({ ...formParams, name: e.target.value })} value={formParams.name}></input>
            </div>
            <div>
              <label className="block text-green-500 text-sm font-bold mb-2" htmlFor="description">NFT Description</label>
              <textarea className="w-full px-3 py-2 placeholder-gray-300 border rounded-md focus:ring focus:ring-green-200 focus:outline-none focus:border-purple-500" cols="40" rows="5" id="description" type="text" placeholder="Axie Infinity Collection" value={formParams.description} onChange={e => updateFormParams({ ...formParams, description: e.target.value })}></textarea>
            </div>
            <div>
              <label className="block text-green-500 text-sm font-bold mb-2" htmlFor="price">Price (in ETH)</label>
              <input className="w-full px-3 py-2 placeholder-gray-300 border rounded-md focus:ring focus:ring-green-200 focus:outline-none focus:border-purple-500" type="number" placeholder="Min 0.01 ETH" step="0.01" value={formParams.price} onChange={e => updateFormParams({ ...formParams, price: e.target.value })}></input>
            </div>
            <div>
              <label className="block text-green-500 text-sm font-bold mb-2" htmlFor="image">Upload Image (&lt;500 KB)</label>
              <input type={"file"} onChange={onChangeFile}></input>
            </div>
            <div className="text-red-500 text-center">{message}</div>
            <button onClick={listNFT} className="w-full px-4 py-2 bg-green-500 text-white font-semibold rounded-md shadow-md hover:bg-white focus:outline-none focus:ring focus:ring-purple-200 focus:ring-opacity-50" id="list-button">
              List NFT
            </button>
          </form>
        </div>
        <div className="w-1/2">
          <img src={bgform} alt="formdes" className="w-100" />
        </div>
      </div>
    </div>
  );
}
