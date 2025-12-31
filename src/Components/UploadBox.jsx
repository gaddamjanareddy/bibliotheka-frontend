import React, { useEffect, useState } from "react";
import { PhotoIcon } from "@heroicons/react/24/solid";

const UploadBox = ({ file, setFile }) => {
    const [preview, setPreview] = useState(null);

    useEffect(() => {
    if (!file) { setPreview(null); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url); 
  }, [file]);

  return (
    <div>
      {/* Preview if file exists */}
      {file && (
        <div className="mb-3">
          <img src={preview}
            alt="preview"
            className="h-30 w-full object-cover rounded-lg border"
          />
        </div>
      )}

      {/* Upload Box */}
      <label
        className="
          flex flex-col items-center justify-center
          border-1 border-solid border-gray-400
          rounded-lg p-3 cursor-pointer
          bg-gray-50 hover:bg-gray-100 transition
        "
      >
        <PhotoIcon className="h-10 w-10 text-gray-500 mb-2" />
        <p className="text-gray-600 text-sm">
          {file ? "Change Image" : "Click to Upload or Drag & Drop"}
        </p>

        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => setFile(e.target.files[0])}
        />
      </label>
    </div>
  );
};

export default UploadBox;
