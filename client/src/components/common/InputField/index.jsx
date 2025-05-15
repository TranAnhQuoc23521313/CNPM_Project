import React from 'react';
import PropTypes from 'prop-types';
import { TextField } from '@mui/material';
import { Controller } from 'react-hook-form';

function InputField(props) {
  const { form, name, label, disabled } = props;
  const {
    formState: { errors },
  } = form;

  const hasError = errors[name];

  return (
    <div>
      <Controller
        name={name}
        control={form.control}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            margin="normal"
            variant="outlined"
            label={label}
            disabled={disabled}
            error={!!hasError}
            helperText={errors[name]?.message}
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
    </div>
  );
}

InputField.propTypes = {
  form: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  disabled: PropTypes.bool,
};

export default InputField;
