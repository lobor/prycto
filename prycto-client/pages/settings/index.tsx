import { useQuery } from "@apollo/client";
import { useFormik } from "formik";
import Head from "next/head";
import { FormattedMessage } from "react-intl";
import * as Yup from "yup";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Label from "../../components/Label";
import Loading from "../../components/Loading";
import { UserDocument } from "../../generated/graphql";

const Settings = () => {
  const { data, loading } = useQuery(UserDocument);
  const formik = useFormik({
    validationSchema: Yup.object({
      email: Yup.string().email().required(),
      password: Yup.string()
        .required()
        .min(8, "Password is too short - should be 8 chars minimum.")
        .matches(/[a-zA-Z]/, "Password can only contain Latin letters."),
      confirmPassword: Yup.string()
        .required()
        .oneOf([Yup.ref("password"), null], "Passwords must match"),
    }),
    enableReinitialize: true,
    initialValues: (data && data.user) || {
      email: "",
      password: "",
      confirmPassword: "",
    },
    onSubmit: (values) => {
      console.log(values);
    },
  });

  if (loading) {
    return (
      <div className="mt-20 flex items-center justify-center">
        <Loading />
      </div>
    );
  }
  return (
    <div className="text-gray-200">
      <Head>
        <title>Settings - Prycto</title>
        <meta name="description" content="Settings - Prycto" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {!loading && (
        <form onSubmit={formik.handleSubmit} className="m-auto w-1/3 mt-10">
          <Label label={<FormattedMessage id="settings.email" />}>
            <Input
              name="email"
              type="email"
              onChange={formik.handleChange}
              value={formik.values.email}
              error={formik.touched.email && (formik.errors.email as string)}
            />
          </Label>
          <Label label={<FormattedMessage id="settings.password" />}>
            <Input
              name="password"
              type="password"
              onChange={formik.handleChange}
              value={formik.values.password}
              error={
                formik.touched.password && (formik.errors.password as string)
              }
            />
          </Label>
          <Label label={<FormattedMessage id="settings.confirmPassword" />}>
            <Input
              name="confirmPassword"
              type="password"
              onChange={formik.handleChange}
              value={formik.values.confirmPassword}
              error={
                formik.touched.confirmPassword &&
                (formik.errors.confirmPassword as string)
              }
            />
          </Label>
          <Button
            type="submit"
            disabled={!formik.isValid || formik.isSubmitting}
          >
            <FormattedMessage id="save" />
          </Button>
        </form>
      )}
    </div>
  );
};

export default Settings;
