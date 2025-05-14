import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { login } from '../userSlice';
import { unwrapResult } from '@reduxjs/toolkit';
import LoginForm from '../LoginForm';
import { useSnackbar } from 'notistack';
//import { useNavigate } from 'react-router-dom';

export const Login = (props) => {
  const dispatch = useDispatch();
 // const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const handleSubmit = async (values) => {
    try {
      const submitValues = {
        email: values.email,
        password: values.password,
      };

      const action = login(submitValues);
      const resultAction = await dispatch(action);
      unwrapResult(resultAction);

      enqueueSnackbar('Đăng nhập thành công !', { variant: 'success' });

      // Close dialog
      const { closedialog } = props;
      if (closedialog) {
        closedialog();
      }

      // Redirect to cinema management page
      // navigate('/cinemamanagement');
    } catch (error) {
      console.log('Failed to login:', error);
      enqueueSnackbar(error.message, { variant: 'error' });
    }
  };

  return (
    <div>
      <LoginForm onSubmit={handleSubmit} />
    </div>
  );
};

Login.propTypes = {
  closedialog: PropTypes.func,
};

export default Login;
