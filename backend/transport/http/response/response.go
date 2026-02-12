package response

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/lesprivate/backend/shared/base"
)

func Failure(w http.ResponseWriter, applies ...func(b *base.Base)) {
	baseResponse := base.Failure()
	for _, apply := range applies {
		apply(baseResponse)
	}

	respond(w, baseResponse)
}

func File(w http.ResponseWriter, fileName string, body []byte) {
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s", fileName))
	w.WriteHeader(http.StatusOK)
	w.Write(body)
}

func Success(w http.ResponseWriter, httpCode int, data interface{}, applies ...func(b *base.Base)) {
	baseResponse := base.Success()
	baseResponse.StatusCode = httpCode
	baseResponse.Data = data
	for _, apply := range applies {
		apply(baseResponse)
	}

	respond(w, baseResponse)
}

func respond(w http.ResponseWriter, baseResponse *base.Base) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(baseResponse.StatusCode)

	b, _ := json.Marshal(baseResponse)
	w.Write(b)
}
