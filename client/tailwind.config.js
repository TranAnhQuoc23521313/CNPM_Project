// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   content: [
//     "./src/**/*.{js,jsx,ts,tsx}"
//   ],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// }

// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Đường dẫn đến các file nguồn của bạn
  ],
  theme: {
    extend: {
      colors: {
        'primary-text': '#2d3748',
        'secondary-text': '#4a5568',
        'tertiary-text': '#718096',
        'border-light': '#e2e8f0',
        'border-medium': '#cbd5e0',
        'accent': '#3182ce', // Xanh dương
        'accent-dark': '#2b6cb0',
        'background-light': '#f7fafc',
        'success': '#38a169', // Xanh lá
        'success-dark': '#2f855a',
        'danger': '#e53e3e', // Đỏ
        'modal-background': '#ffffff',
        // Thêm các màu cho ghế nếu cần định danh rõ hơn
        'seat-booked-bg': '#4a5568', // Tương đương secondary-text
        'seat-booked-border': '#2d3748', // Tương đương primary-text
        'seat-available-text': '#3182ce', // accent
        'seat-available-border': '#3182ce', // accent
        'seat-available-bg-hover': '#ebf8ff',
        'seat-unavailable-bg': '#f7fafc', // background-light
        'seat-unavailable-text': '#718096', // tertiary-text
        'seat-unavailable-border': '#e2e8f0', // border-light
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"', '"Segoe UI Symbol"'],
      },
      boxShadow: {
        'modal': '0 15px 35px rgba(50, 50, 93, 0.1), 0 5px 15px rgba(0, 0, 0, 0.07)',
        'seat-selected': '0 0 0 2px rgba(56, 161, 105, 0.3)', // Viền mờ cho ghế được chọn
        'seat-hover': '0 2px 8px rgba(0,0,0,0.1)',
      },
      // Nếu bạn muốn sử dụng các giá trị spacing/kích thước chính xác như trong CSS cũ
      // thay vì dùng thang đo của Tailwind, bạn có thể định nghĩa chúng ở đây.
      // Ví dụ:
      spacing: {
        '22px': '22px',
        '28px': '28px',
        '30px': '30px',
        '32px': '32px',
        '35px': '35px',
        // ...
      },
      maxWidth: {
        '1050px': '1050px',
      },
      maxHeight: {
        '90vh': '90vh',
      },
      fontSize: {
        '0.875em': '0.875em', // ~14px
        '0.925rem': '0.925rem', // ~14.8px
        '1.15rem': '1.15rem', // ~18.4px
        '1.3rem': '1.3rem',   // ~20.8px
        '1.65rem': '1.65rem', // ~26.4px
      },
      letterSpacing: {
        '0.075em': '0.075em',
      }
    },
  },
  plugins: [],
}
