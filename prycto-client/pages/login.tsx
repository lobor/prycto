import Head from "next/head";
import * as Yup from "yup";
import Snackbar from "../components/Snackbar";
import Input from "../components/Input";
import Button from "../components/Button";
import { useFormik } from "formik";
import Label from "../components/Label";
import { useMutation } from "@apollo/client";
import {
  LoginDocument,
  LoginMutation,
  LoginMutationVariables,
} from "../generated/graphql";
import { useRouter } from "next/dist/client/router";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const [login, { data, error }] = useMutation<LoginMutation, LoginMutationVariables>(
    LoginDocument,
    {
      onCompleted: () => {
        router.push("/positions");
      },
    }
  );
  const formik = useFormik({
    validationSchema: Yup.object({
      email: Yup.string().email().required(),
      password: Yup.string()
        .required()
        .min(8, "Password is too short - should be 8 chars minimum.")
        .matches(/[a-zA-Z]/, "Password can only contain Latin letters."),
    }),
    initialValues: {
      email: "",
      password: "",
    },
    onSubmit: (values) => {
      login({ variables: values });
    },
  });

  useEffect(() => {
    if (data && data.login) {
      localStorage.setItem('token', data.login);
    }
  }, [data])
  return (
    <div>
      <Head>
        <title>login - Prycto</title>
        <meta name="description" content="Login - Prycto" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Snackbar />
      <div className="flex content-center items-center flex-col mt-40 text-gray-200">
        <div className="flex items-center flex-col w-full p-3 md:p-0 md:w-1/6">
          <h1>Login</h1>
          <form onSubmit={formik.handleSubmit} className="inline-block w-full">
            <Label label="Email">
              <Input
                name="email"
                type="email"
                onChange={formik.handleChange}
                value={formik.values.email}
                error={formik.touched.email && formik.errors.email}
              />
            </Label>
            <Label label="Password">
              <Input
                type="password"
                name="password"
                onChange={formik.handleChange}
                value={formik.values.password}
                error={formik.touched.password && formik.errors.password}
              />
            </Label>
            {error && <div className="text-red-600 pb-2">{error.message}</div>}
            <div className="flex flex-row justify-between">
              <Button variant="link" onClick={() => router.push("/register")}>
                Create account
              </Button>
              <Button type="submit">Login</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
