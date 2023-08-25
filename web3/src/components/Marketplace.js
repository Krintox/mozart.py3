import Navbar from "./Navbar";
import NFTTile from "./NFTTile";
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useState, useEffect } from "react";
import { GetIpfsUrlFromPinata } from "../utils";

export default function Marketplace() {
  const [data, updateData] = useState([]);
  const [dataFetched, updateFetched] = useState(false);

  async function getAllNFTs() {
    try {
      const ethers = require("ethers");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        MarketplaceJSON.address,
        MarketplaceJSON.abi,
        signer
      );
      const transaction = await contract.getAllNFTs();

      const items = await Promise.all(
        transaction.map(async (i) => {
          let tokenURI = await contract.tokenURI(i.tokenId);
          tokenURI = GetIpfsUrlFromPinata(tokenURI);
          let meta = await axios.get(tokenURI);
          meta = meta.data;

          let price = ethers.utils.formatUnits(i.price.toString(), "ether");
          let item = {
            price,
            tokenId: i.tokenId.toNumber(),
            seller: i.seller,
            owner: i.owner,
            image: meta.image,
            name: meta.name,
            description: meta.description,
          };
          return item;
        })
      );

      updateData(items);
      updateFetched(true);
    } catch (error) {
      console.error("Error fetching NFTs:", error);
    }
  }

  useEffect(() => {
    if (!dataFetched) {
      getAllNFTs();
    }
  }, [dataFetched]);

  return (
    <div>
      <Navbar />
      <div className="container mx-auto mt-10">
        <h1 className="text-4xl font-bold text-white mb-5">Top NFTs</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((value, index) => {
            return <NFTTile data={value} key={index} />;
          })}
        </div>
      </div>
    </div>
  );
}
