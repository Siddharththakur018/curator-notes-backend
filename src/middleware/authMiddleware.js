const admin = require("../config/firebaseAdmin");

export const verifyFirebaseToken = async(req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if(!authHeader || !authHeader.startsWith("Bearer ")){
            return res.json(401).json({message: "No token provided"})
        }

        const token = authHeader.split("Bearer ")[1];

        const decodedToken = await admin.auth().verifyIdToken(token);

        req.user = decodedToken;
        next();
    } catch (error) {
        res.status(500).json({message: error.message})
        console.error(error)
    }
}