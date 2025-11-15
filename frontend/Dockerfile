# Sử dụng base image Node.js
FROM node:22-alpine

# Đặt thư mục làm việc
WORKDIR /usr/src/app

# Sao chép package.json và package-lock.json
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Sao chép toàn bộ source code của frontend
COPY . .

# Vite chạy mặc định ở port 5173
EXPOSE 5173

# Lệnh để chạy Vite dev server
# QUAN TRỌNG: Thêm "-- --host 0.0.0.0"
# để server có thể được truy cập từ bên ngoài container
CMD [ "npm", "run", "dev", "--", "--host", "0.0.0.0" ]
