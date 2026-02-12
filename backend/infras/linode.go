package infras

import (
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"

	"github.com/lesprivate/backend/config"
)

type Linode struct {
	Client *s3.S3
}

func NewLinode(c *config.Config) *Linode {
	sess := session.Must(session.NewSessionWithOptions(session.Options{
		Config: aws.Config{
			Credentials: credentials.NewStaticCredentials(c.Linode.AccessKey, c.Linode.SecretKey, ""),
			Region:      aws.String(c.Linode.Region),
			Endpoint:    aws.String(c.Linode.Endpoint),
		},
	}))

	client := s3.New(sess)
	return &Linode{
		Client: client,
	}
}
