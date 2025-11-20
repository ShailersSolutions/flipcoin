import { useRouter } from 'expo-router';
import { Formik } from 'formik';
import { useContext, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import * as Yup from 'yup';
import { AuthContext } from '../../context/AuthContext';

const RegisterSchema = Yup.object().shape({
  username: Yup.string().required('Username is required').min(3, 'Too short'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  referralCode: Yup.string().optional(),
});

const RegisterScreen = () => {
  const { register } = useContext(AuthContext);
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('');

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Formik
        initialValues={{ username: '', email: '', password: '', referralCode: '' }}
        validationSchema={RegisterSchema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            setErrorMessage('');
            await register(values.email, values.password, values.username, values.referralCode);
          } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Registration failed');
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
          <View style={styles.form}>
            <Text style={styles.title}>Create Account</Text>

            <TextInput
              label="Username"
              value={values.username}
              onChangeText={handleChange('username')}
              onBlur={handleBlur('username')}
              mode="outlined"
              style={styles.input}
              error={touched.username && !!errors.username}
            />
            <HelperText type="error" visible={touched.username && !!errors.username}>
              {errors.username}
            </HelperText>

            <TextInput
              label="Email"
              value={values.email}
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              keyboardType="email-address"
              autoCapitalize="none"
              mode="outlined"
              style={styles.input}
              error={touched.email && !!errors.email}
            />
            <HelperText type="error" visible={touched.email && !!errors.email}>
              {errors.email}
            </HelperText>

            <TextInput
              label="Password"
              value={values.password}
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              secureTextEntry
              mode="outlined"
              style={styles.input}
              error={touched.password && !!errors.password}
            />
            <HelperText type="error" visible={touched.password && !!errors.password}>
              {errors.password}
            </HelperText>

            <TextInput
              label="Referral Code (optional)"
              value={values.referralCode}
              onChangeText={handleChange('referralCode')}
              onBlur={handleBlur('referralCode')}
              mode="outlined"
              style={styles.input}
            />

            {errorMessage ? (
              <HelperText type="error" visible>
                {errorMessage}
              </HelperText>
            ) : null}

            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={isSubmitting}
              disabled={isSubmitting}
              style={styles.button}
            >
              Register
            </Button>

            <TouchableOpacity onPress={() => router.push('/auth/login')}>
              <Text style={styles.switchText}>
                Already have an account? <Text style={styles.link}>Login</Text>
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </Formik>
    </KeyboardAvoidingView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  form: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
    paddingVertical: 6,
  },
  switchText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
  },
  link: {
    color: '#007bff',
    fontWeight: '600',
  },
});


export default RegisterScreen;
