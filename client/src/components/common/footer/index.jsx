// components/Footer.jsx
import React from 'react'
import { Box, Typography } from '@mui/material'

const Footer = () => {
  return (
    <Box
      sx={{
        mt: 8,
        py: 4,
        backgroundColor: '#000',
        color: '#ccc',
        textAlign: 'center',
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#fff' }}>
        Nhóm phát triển: Nhóm ? - Đồ án Web - Quản lý rạp chiếu phim
      </Typography>
      <Typography variant="body2" sx={{ mt: 1 }}>
        Thành viên: Nguyễn Văn Quyền , Trần Anh Quốc , Nguyễn Minh Quốc , Trần Nhật Quang.
      </Typography>
      <Typography variant="body2" sx={{ mt: 1 }}>
        Trường Đại học công nghệ thông tin - Khoa Khoa Học Máy Tính
      </Typography>
      <Typography variant="caption" sx={{ mt: 2, display: 'block', color: '#888' }}>
        &copy; {new Date().getFullYear()} Nhóm ?. All rights reserved.
      </Typography>
    </Box>
  )
}

export default Footer;
