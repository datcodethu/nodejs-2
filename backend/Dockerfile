# Sử dụng base image Node.js (chọn phiên bản LTS, alpine cho nhẹ)
FROM node:18-alpine

# Đặt thư mục làm việc bên trong container
WORKDIR /usr/src/app

# Sao chép package.json và package-lock.json (nếu có)
# Tách riêng bước này để tận dụng cache của Docker
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Sao chép toàn bộ source code của backend
COPY . .

# Expose port mà app của bạn chạy (ví dụ: 3001)
EXPOSE 3000

# Lệnh để khởi động app (nên dùng nodemon cho development)
# Hãy chắc chắn bạn đã cài nodemon: npm install nodemon
CMD [ "npm", "run", "dev" ] 
# Hoặc dùng "npm", "start" nếu bạn không dùng nodemon
