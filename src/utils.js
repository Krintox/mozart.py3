export const GetIpfsUrlFromPinata = (pinataUrl) => {
    if (!pinataUrl) {
        console.error("Pinata URL is undefined or null.");
        return null;
    }

    var IPFSUrl = pinataUrl.split("/");
    const lastIndex = IPFSUrl.length;
    IPFSUrl = "https://ipfs.io/ipfs/"+IPFSUrl[lastIndex-1];
    return IPFSUrl;
};
