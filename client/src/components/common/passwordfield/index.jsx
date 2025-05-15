import React from 'react';
import PropTypes from 'prop-types';
import { Controller } from 'react-hook-form';
import {
  TextField,
  IconButton,
  InputAdornment
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

function PasswordField(props) {
  const { form, name, label, disabled } = props;
  const [showPassword, setShowPassword] = React.useState(false);
  const {
    formState: { errors },
  } = form;

  const hasError = errors[name];

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Controller
      name={name}
      control={form.control}
      render={({ field }) => (
        <TextField
          {...field}
          fullWidth
          margin="normal"
          variant="outlined"
          type={showPassword ? 'text' : 'password'}
          label={label}
          disabled={disabled}
          error={!!hasError}
          helperText={errors[name]?.message}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleClickShowPassword} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            backgroundColor: '#1e1e1e', // Màu nền tối
            borderRadius: '8px', // Bo góc
            '& .MuiInputBase-root': {
              color: '#fff', // Màu chữ trắng
            },
            '& .MuiFormLabel-root': {
              color: '#fff', // Màu label trắng
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#f5c518', // Màu viền khi hover
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#f5c518', // Màu viền khi focus
            },
          }}
        />
      )}
    />
  );
}

PasswordField.propTypes = {
  form: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  disabled: PropTypes.bool,
};

export default PasswordField;
