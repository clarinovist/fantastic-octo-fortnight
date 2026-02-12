package v1

import (
	"net/http"

	"github.com/lesprivate/backend/shared/base"
	"github.com/lesprivate/backend/transport/http/response"
)

// UploadFile handles file upload requests
// @Summary Upload a file
// @Description Upload a file to object storage with JWT authentication
// @Tags files
// @Security BearerAuth
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "File to upload"
// @Success 200 {object} base.Base{data=dto.UploadResult}
// @Failure 400 {object} base.Base
// @Failure 401 {object} base.Base
// @Failure 413 {object} base.Base
// @Failure 500 {object} base.Base
// @Router /v1/files/upload [post]
func (a *Api) UploadFile(w http.ResponseWriter, r *http.Request) {
	// Parse multipart form with size limit
	err := r.ParseMultipartForm(a.config.File.MaxUploadSize)
	if err != nil {
		response.Failure(w,
			base.SetStatusCode(http.StatusBadRequest),
			base.SetMessage("failed to parse multipart form"),
			base.SetError(err.Error()),
		)
		return
	}

	// Get file from form
	file, header, err := r.FormFile("file")
	if err != nil {
		response.Failure(w,
			base.SetStatusCode(http.StatusBadRequest),
			base.SetMessage("file is required"),
			base.SetError(err.Error()),
		)
		return
	}
	defer file.Close()

	// Validate file type
	err = a.file.ValidateFileType(header.Filename)
	if err != nil {
		response.Failure(w,
			base.SetStatusCode(http.StatusBadRequest),
			base.SetMessage("invalid file type"),
			base.SetError(err.Error()),
		)
		return
	}

	// Upload file
	result, err := a.file.UploadFile(r.Context(), file, header)
	if err != nil {
		// Check if it's a file size error
		if header.Size > a.config.File.MaxUploadSize {
			response.Failure(w,
				base.SetStatusCode(http.StatusRequestEntityTooLarge),
				base.SetMessage("file size exceeds maximum allowed size"),
				base.SetError(err.Error()),
			)
			return
		}

		response.Failure(w,
			base.SetStatusCode(http.StatusInternalServerError),
			base.SetMessage("failed to upload file"),
			base.SetError(err.Error()),
		)
		return
	}

	response.Success(w, http.StatusOK, result)
}
