#!/bin/bash

# Create directories if they don't exist
mkdir -p public/images/cdn

# Download all CDN images
echo "Downloading CDN images..."

# Banner
curl -o public/images/cdn/banner1.png "https://c.animaapp.com/BQZi8LR4/img/banner1.png"

# Logo (use --compressed to handle gzip)
curl --compressed -o public/images/cdn/lesprivat-logo-svg-1.svg "https://c.animaapp.com/BQZi8LR4/img/lesprivat-logo-svg-1.svg"

# Hero section images
curl -o public/images/cdn/no-sketch-2-1.png "https://c.animaapp.com/BQZi8LR4/img/no-sketch-2-1.png"
curl -o public/images/cdn/10328682-png-1.png "https://c.animaapp.com/BQZi8LR4/img/10328682-png-1@2x.png"
curl -o public/images/cdn/7f676c46-4cfd-4859-bb32-efdc6e377490-png-1.png "https://c.animaapp.com/BQZi8LR4/img/7f676c46-4cfd-4859-bb32-efdc6e377490-png-1@2x.png"
curl -o public/images/cdn/subtract.png "https://c.animaapp.com/BQZi8LR4/img/subtract@2x.png"
curl -o public/images/cdn/9825095-png-2.png "https://c.animaapp.com/BQZi8LR4/img/9825095-png-2@2x.png"
curl -o public/images/cdn/9825095-png-3.png "https://c.animaapp.com/BQZi8LR4/img/9825095-png-3@2x.png"
curl -o public/images/cdn/two-asian-kids.png "https://c.animaapp.com/BQZi8LR4/img/two-asian-kids-sitting-classroom-smiling-teacher-glasses-talking.png"

# Slider
curl -o public/images/cdn/slider.png "https://c.animaapp.com/BQZi8LR4/img/slider.png"

# Feature icons (use --compressed to handle gzip)
curl --compressed -o public/images/cdn/famicons-calendar.svg "https://c.animaapp.com/BQZi8LR4/img/famicons-calendar.svg"
curl --compressed -o public/images/cdn/solar-box-bold.svg "https://c.animaapp.com/BQZi8LR4/img/solar-box-bold.svg"
curl --compressed -o public/images/cdn/typcn-location.svg "https://c.animaapp.com/BQZi8LR4/img/typcn-location.svg"

# Teacher images
curl -o public/images/cdn/teacher-1.png "https://c.animaapp.com/BQZi8LR4/img/1-328683.png"
curl -o public/images/cdn/teacher-2.png "https://c.animaapp.com/BQZi8LR4/img/2-147851887.png"
curl -o public/images/cdn/teacher-3.png "https://c.animaapp.com/BQZi8LR4/img/3-2.png"
curl -o public/images/cdn/teacher-4.png "https://c.animaapp.com/BQZi8LR4/img/4-1.png"
curl -o public/images/cdn/teacher-5.png "https://c.animaapp.com/BQZi8LR4/img/5-1.png"
curl -o public/images/cdn/teacher-6.png "https://c.animaapp.com/BQZi8LR4/img/unsplash-di4fy1eixxa.png"

echo "All images downloaded successfully!"
