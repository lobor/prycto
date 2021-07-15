import Head from "next/head";
import * as Yup from "yup";
import Snackbar from "../components/Snackbar";
import Input from "../components/Input";
import Button from "../components/Button";
import { useFormik } from "formik";
import Label from "../components/Label";
import { useMutation } from "@apollo/client";
import {
  RegisterDocument,
  RegisterMutation,
  RegisterMutationVariables,
} from "../generated/graphql";
import { useRouter } from "next/dist/client/router";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const [register, { data, error }] = useMutation<RegisterMutation, RegisterMutationVariables>(
    RegisterDocument,
    {
      onCompleted: () => {
        router.push("/login");
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
      confirmPassword: Yup.string().oneOf(
        [Yup.ref("password"), null],
        "Passwords must match"
      ),
    }),
    initialValues: {
      email: "",
      password: "",
      confirmPassword: ''
    },
    onSubmit: (values) => {
      register({ variables: values });
    },
  });
  return (
    <div>
      <Head>
        <title>Create account - Prycto</title>
        <meta name="description" content="Create account - Prycto" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Snackbar />
      <div className="flex content-center items-center flex-col mt-40 text-gray-200">
        <div className="flex items-center flex-col w-1/6">
          <h1>Create account</h1>
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
            <Label label="Confirm password">
              <Input
                type="password"
                name="confirmPassword"
                onChange={formik.handleChange}
                value={formik.values.confirmPassword}
                error={formik.touched.confirmPassword && formik.errors.confirmPassword}
              />
            </Label>
            {error && <div className="text-red-600 pb-2">{error.message}</div>}
            <div className="flex flex-row justify-between">
              <Button variant="link" onClick={() => router.push("/login")}>
                Login
              </Button>
              <Button type="submit">Create account</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
