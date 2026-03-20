export const getServerSync = (req,res) => {
    const serverTime = new Date();
    return res.json({serverTime});
}