import React from 'react';

const Images = ({ formData, isSaving, handleImageUpload, handleAddImageUrl, removeImage, setPreviewImage }) => {
  return (
    <>
      {/* Patient Images Section */}
      <div
        style={{
          marginBottom: "0px",
          paddingBottom: "0px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: "0.9rem",
            fontWeight: "600",
            color: "#64748b",
            marginBottom: "12px",
            justifyContent: 'space-between'
          }}
        >
          Patient Images
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => document.getElementById('image-upload').click()}
              disabled={isSaving}
              style={{
                background: isSaving ? "#6b7885" : "#3454d1",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                padding: "6px 12px",
                cursor: "pointer",
                fontSize: "0.75rem",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                opacity: isSaving ? 0.7 : 1,
              }}
            >
              {isSaving ? "⏳ Uploading..." : "Upload"}
            </button>
            <button
              onClick={handleAddImageUrl}
              style={{
                background: "#3dc7be",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                padding: "6px 12px",
                cursor: "pointer",
                fontSize: "0.75rem",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              Add URL
            </button>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          id="image-upload"
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          {formData.images && formData.images.length > 0 ? (
            formData.images.map((image, index) => {
              let imageUrl;

              // Handle different image types
              if (image instanceof File) {
                imageUrl = URL.createObjectURL(image);
              } else if (typeof image === 'string') {
                imageUrl = image;
              } else if (image && image.url) {
                imageUrl = image.url;
              } else {
                return null; // Skip invalid images
              }

              return (
                <div
                  key={index}
                  style={{
                    position: "relative",
                    width: "120px",
                    height: "120px",
                    border: `2px solid #e2e8f0`,
                    borderRadius: "8px",
                    overflow: "hidden",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  <img
                    src={imageUrl}
                    alt={`Patient image ${index + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      cursor: "pointer",
                    }}
                    onClick={() => setPreviewImage(imageUrl)}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      // Show error placeholder
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  {/* Error fallback */}
                  <div
                    style={{
                      display: 'none',
                      width: "100%",
                      height: "100%",
                      background: "#f8fafc",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "column",
                      color: "#64748b",
                      fontSize: "0.7rem",
                      textAlign: "center",
                      padding: "8px",
                    }}
                  >
                    🖼️<br />Image not available
                  </div>
                  <button
                    onClick={() => removeImage(index)}
                    style={{
                      position: "absolute",
                      top: "4px",
                      right: "4px",
                      background: "#d13b4c",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "50%",
                      width: "24px",
                      height: "24px",
                      fontSize: "12px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                    }}
                    title="Remove image"
                  >
                    ✕
                  </button>
                </div>
              );
            }).filter(Boolean)
          ) : (
            <div style={{
              width: "100%",
              padding: "40px 20px",
              textAlign: "center",
              color: "#64748b",
              fontStyle: "italic",
              fontSize: "0.9rem",
              background: "#f8fafc",
              borderRadius: "8px",
              border: `2px dashed #e2e8f0`,
            }}>
              No patient images available. Upload images or add image URLs.
            </div>
          )}
        </div>

        {/* Image count and instructions */}
        {formData.images && formData.images.length > 0 && (
          <div style={{
            marginTop: "8px",
            fontSize: "0.75rem",
            color: "#64748b",
            textAlign: "center",
          }}>
            {formData.images.length} image(s) • Click to preview
          </div>
        )}
      </div>
    </>
  );
};

export default Images;