#!/bin/bash

# Create directories
mkdir -p public/images

# Download all images
echo "Downloading assets..."

curl -o public/images/banner1.png "https://c.animaapp.com/BQZi8LR4/img/banner1.png"
curl -o public/images/lesprivat-logo-svg-1.svg "https://c.animaapp.com/BQZi8LR4/img/lesprivat-logo-svg-1.svg"
curl -o public/images/no-sketch-2-1.png "https://c.animaapp.com/BQZi8LR4/img/no-sketch-2-1.png"
curl -o public/images/two-asian-kids.png "https://c.animaapp.com/BQZi8LR4/img/two-asian-kids-sitting-classroom-smiling-teacher-glasses-talking.png"
curl -o public/images/famicons-calendar.svg "https://c.animaapp.com/BQZi8LR4/img/famicons-calendar.svg"
curl -o public/images/solar-box-bold.svg "https://c.animaapp.com/BQZi8LR4/img/solar-box-bold.svg"
curl -o public/images/solar-box-bold-1.svg "https://c.animaapp.com/BQZi8LR4/img/solar-box-bold-1.svg"
curl -o public/images/typcn-location.svg "https://c.animaapp.com/BQZi8LR4/img/typcn-location.svg"
curl -o public/images/teacher-1.png "https://c.animaapp.com/BQZi8LR4/img/1-328683.png"
curl -o public/images/teacher-2.png "https://c.animaapp.com/BQZi8LR4/img/2-147851887.png"
curl -o public/images/teacher-3.png "https://c.animaapp.com/BQZi8LR4/img/3-2.png"
curl -o public/images/teacher-4.png "https://c.animaapp.com/BQZi8LR4/img/4-1.png"
curl -o public/images/teacher-5.png "https://c.animaapp.com/BQZi8LR4/img/5-1.png"
curl -o public/images/teacher-6.png "https://c.animaapp.com/BQZi8LR4/img/unsplash-di4fy1eixxa.png"

echo "All assets downloaded successfully!"
