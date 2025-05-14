import React from 'react';
import PropTypes from 'prop-types';
import InputField from '../../../../components/form-controls/InputField';
import { useForm } from 'react-hook-form';
import { Avatar, Typography, Button, Box, LinearProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import PasswordField from '../../../../components/form-controls/passwordfield';

import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Styled components
const Root = styled(Box)(({ theme }) => ({
  position : 'relative',
  paddingTop: theme.spacing(4),
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  margin: '0 auto',
  backgroundColor: theme.palette.secondary.main,
}));

const Title = styled(Typography)(({ theme }) => ({
  margin: theme.spacing(2, 0, 3, 0),
  textAlign: 'center',
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

const Progress = styled(LinearProgress)(({ theme }) => ({
  position : 'absolute',
  top: theme.spacing(1),
  left : 0,
  right: 0,
}));

const LoginForm = (props) => {

  // validation
  const schema = yup.object().shape({
    email: yup
      .string()
      .email('Invalid email')
      .required('Email is required'),
    password: yup
      .string()
      .required('Password is required'),
  });
  const form = useForm({
    defaultValues: {
        email: '',
      password: '',
    },
    resolver: yupResolver(schema), 
  });

  const onSubmit = async (values) => {
    const {onSubmit} = props;
    if (onSubmit) {
      await onSubmit(values);
    }
  };
  const {isSubmitting} = form.formState;
  return (
    <Root>
      {isSubmitting && <Progress /> }
      <StyledAvatar />

      <Title component="h3" variant="h5">
        Sign In
      </Title>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <InputField name="email" label="Email" form={form} />
        <PasswordField name="password" label="Password" form={form} />

        <SubmitButton disabled = {isSubmitting} variant="contained" color="primary" type="submit" fullWidth>
          Sign In 
        </SubmitButton>
      </form>
    </Root>
  );
};

LoginForm.propTypes = {
  onSubmit: PropTypes.func,
};

export default LoginForm;
