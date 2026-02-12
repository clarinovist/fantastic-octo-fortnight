ARG GO_VERSION=1.24
# Builder
FROM golang:${GO_VERSION}-alpine as builder

RUN apk update && \
    apk --update add git make build-base

WORKDIR /app

COPY . .

RUN GOFLAGS="-buildvcs=false" go generate ./...
RUN GOFLAGS="-buildvcs=false" go build -o goBinary .

# Distribution
FROM alpine:latest

RUN apk update && apk --update --no-cache add tzdata && \
        apk --no-cache add ca-certificates \
        ttf-dejavu ttf-droid ttf-freefont ttf-liberation \
        libxrender libgcc libstdc++

ENV TZ=Asia/Jakarta

WORKDIR /app

EXPOSE 9090

RUN mkdir -p /app/templates

COPY --from=ghcr.io/surnet/alpine-wkhtmltopdf:3.17.0-0.12.6-full /bin/wkhtmltopdf /bin/wkhtmltopdf
COPY --from=ghcr.io/surnet/alpine-wkhtmltopdf:3.17.0-0.12.6-full /bin/wkhtmltoimage /bin/wkhtmltoimage

COPY --from=builder /app/goBinary /app
COPY --from=builder /app/templates /app/templates

CMD /app/goBinary
