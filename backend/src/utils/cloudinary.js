import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath, resourceType = "auto") => {
    try {
        if(!localFilePath) return null

        console.log('Starting Cloudinary upload for:', localFilePath);
        
        // Check file size
        const stats = fs.statSync(localFilePath);
        const fileSizeInMB = stats.size / (1024 * 1024);
        console.log('File size:', fileSizeInMB.toFixed(2), 'MB');
        
        // Use upload_large for files over 100MB
        if (fileSizeInMB > 100 && resourceType === "video") {
            const response = await cloudinary.uploader.upload_large(localFilePath, {
                resource_type: "video",
                chunk_size: 6000000,
                timeout: 600000
            });
            
            console.log('Cloudinary large upload successful:', response.url);
            
            if (fs.existsSync(localFilePath)) {
                fs.unlinkSync(localFilePath)
            }
            return response;
        }
        
        // Regular upload for smaller files
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type: resourceType === "video" ? "video" : "auto",
            chunk_size: 6000000,
            timeout: 600000
        })

        console.log('Cloudinary upload successful:', response.url);
        
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath)
        }
        return response;

    } catch (error) {
        console.error('Cloudinary upload error:', error);
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath)
        }
        return null;
    }
}


const deleteFromCloudinary = async (publicId, resourceType = "auto") => {
    try {
        if (!publicId) return null;
        
        const response = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType
        });
        
        return response;
    } catch (error) {
        console.log("Error deleting from cloudinary:", error);
        return null;
    }
}

const extractPublicId = (url) => {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    return filename.split('.')[0];
}

export {uploadOnCloudinary, deleteFromCloudinary, extractPublicId}