import React from 'react'
import PropTypes from 'prop-types'
import FilmList from '../components/ListFilm'
import { Typography, Box } from '@mui/material'

const ListFilmFeature = props => {
  const ListFilmHot = [
    {
      id: 1,
      name: 'SHIN CẬU BÉ BÚT CHÌ',
      url: 'https://cinestar.com.vn/_next/image/?url=https%3A%2F%2Fapi-website.cinestar.com.vn%2Fmedia%2Fwysiwyg%2FPosters%2F05-2025%2Fshin.png&w=1920&q=75',
    },
    {
      id: 2,
      name: 'LẬT MẶT 8 : VÒNG TAY NẮNG',
      url: 'https://cinestar.com.vn/_next/image/?url=https%3A%2F%2Fapi-website.cinestar.com.vn%2Fmedia%2Fwysiwyg%2FPosters%2F04-2025%2Flat-mat-poster.png&w=1920&q=75',
    },
    {
      id: 3,
      name: 'BIỆT ĐỘI SẤM SÉT',
      url: 'https://cinestar.com.vn/_next/image/?url=https%3A%2F%2Fapi-website.cinestar.com.vn%2Fmedia%2Fwysiwyg%2FPosters%2F05-2025%2Fthunderbolts-poster.png&w=1920&q=75',
    },
    {
      id: 4,
      name: 'ĐỘI THỢ SĂN QUỶ',
      url: 'https://cinestar.com.vn/_next/image/?url=https%3A%2F%2Fapi-website.cinestar.com.vn%2Fmedia%2Fwysiwyg%2FPosters%2F05-2025%2Fholy-night-poster.jpg&w=1920&q=75',
    },
  ]

  const ListFilmLive = [
    {
      id: 1,
      name: 'BÍ MẬT KINH HOÀNG',
      url: 'https://cinestar.com.vn/_next/image/?url=https%3A%2F%2Fapi-website.cinestar.com.vn%2Fmedia%2Fwysiwyg%2FPosters%2F05-2025%2Funtil-dawn-poster.jpg&w=1920&q=75',
    },
    {
      id: 2,
      name: 'BA MẶT LẬT KÈO',
      url: 'https://cinestar.com.vn/_next/image/?url=https%3A%2F%2Fapi-website.cinestar.com.vn%2Fmedia%2Fwysiwyg%2FPosters%2F05-2025%2Fyadang-ba-mat-lat-keo.jpg&w=1920&q=75',
    },
    {
      id: 3,
      name: 'ĐẠI NÁO SỞ THÚ',
      url: 'https://cinestar.com.vn/_next/image/?url=https%3A%2F%2Fapi-website.cinestar.com.vn%2Fmedia%2Fwysiwyg%2FPosters%2F05-2025%2Fquai-thu-dai-nao-so-thu.jpg&w=1920&q=75',
    },
    {
      id: 4,
      name: 'KÝ ỨC MÁU',
      url: 'https://cinestar.com.vn/_next/image/?url=https%3A%2F%2Fapi-website.cinestar.com.vn%2Fmedia%2Fwysiwyg%2FPosters%2F05-2025%2Fky-uc-mau.jpg&w=1920&q=75',
    },
  ]

  const ImminentListFilm = [
    {
      id: 1,
      name: 'TỘI ĐỒ',
      url: 'https://cinestar.com.vn/_next/image/?url=https%3A%2F%2Fapi-website.cinestar.com.vn%2Fmedia%2Fwysiwyg%2FPosters%2F05-2025%2Fsinner.jpg&w=1920&q=75',
    },
    {
      id: 2,
      name: 'LILO & STITICH',
      url: 'https://cinestar.com.vn/_next/image/?url=https%3A%2F%2Fapi-website.cinestar.com.vn%2Fmedia%2Fwysiwyg%2FPosters%2F05-2025%2Flilo-stitch.jpg&w=1920&q=75',
    },
    {
      id: 3,
      name: 'ĐIỆP QUỶ TÂN NƯƠNG',
      url: 'https://cinestar.com.vn/_next/image/?url=https%3A%2F%2Fapi-website.cinestar.com.vn%2Fmedia%2Fwysiwyg%2FPosters%2F05-2025%2Fdiep-quy-tan-nuong.jpg&w=1920&q=75',
    },
    {
      id: 4,
      name: 'DƯỚI ĐÁY HỒ',
      url: 'https://cinestar.com.vn/_next/image/?url=https%3A%2F%2Fapi-website.cinestar.com.vn%2Fmedia%2Fwysiwyg%2FPosters%2F06-2025%2Fduoi-day-ho.jpg&w=1920&q=75',
    },
  ]

  return (
    <Box sx={{ mt: 6 }}>
      <Typography
        variant="h4"
        component="h2"
        sx={{
          fontWeight: 'bold',
          color: '#fff',
          mb: 4,
          textAlign: 'center',
        }}
      >
        PHIM HOT
      </Typography>
      <FilmList filmlist={ListFilmHot} />

      <Typography
        variant="h4"
        component="h2"
        sx={{
          fontWeight: 'bold',
          color: '#fff',
          mt: 6,
          mb: 4,
          textAlign: 'center',
        }}
      >
        PHIM ĐANG CHIẾU
      </Typography>
      <FilmList filmlist={ListFilmLive} />

      <Typography
        variant="h4"
        component="h2"
        sx={{
          fontWeight: 'bold',
          color: '#fff',
          mt: 6,
          mb: 4,
          textAlign: 'center',
        }}
      >
        PHIM SẮP CHIẾU
      </Typography>
      <FilmList filmlist={ImminentListFilm} />
    </Box>
  )
}

ListFilmFeature.propTypes = {}

export default ListFilmFeature
