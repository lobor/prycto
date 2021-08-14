import { useRouter } from "next/dist/client/router";
import Dropdown from "./Dropdown";
import Link from "next/link";
import { FormattedMessage } from "react-intl";
// @ts-ignore
import Flag from "country-flag-icons/react/3x2";
import { useMutation, useQuery } from "@apollo/client";
import {
  UpdateLangDocument,
  UpdateLangMutation,
  UpdateLangMutationVariables,
  UserDocument,
  UserQuery,
} from "../generated/graphql";
import { useEffect } from "react";

const SelectLang = () => {
  const { loading, data } = useQuery<UserQuery>(UserDocument);
  const [updateLang] = useMutation<
    UpdateLangMutation,
    UpdateLangMutationVariables
  >(UpdateLangDocument);
  const router = useRouter();
  const locale = !router.locale
    ? "en"
    : router.locale === "en"
    ? "us"
    : router.locale;
  const LabelLanguage = Flag[locale.toUpperCase()] || Flag.US;

  useEffect(() => {
    if (data && data.user.lang !== router.locale) {
      router.push(router.asPath, router.asPath, { locale: data.user.lang });
    }
  }, [data, router.locale, router.asPath]);

  const handleChangeLang = (lang: string) => () => {
    updateLang({ variables: { lang } });
  };
  return (
    <Dropdown
      label={<LabelLanguage className="w-6" />}
      menu={[
        {
          component: (
            <Link href={router.asPath} locale="fr">
              <a
                className="px-4 py-2 text-sm hover:bg-gray-800 flex items-center"
                onClick={handleChangeLang("fr")}
              >
                <Flag.FR className="w-6 mr-2" />
                <FormattedMessage id="french" />
              </a>
            </Link>
          ),
        },
        {
          component: (
            <Link href={router.asPath} locale="en">
              <a
                className="px-4 py-2 text-sm hover:bg-gray-800 flex items-center"
                onClick={handleChangeLang("en")}
              >
                <Flag.US className="w-6 mr-2" />
                <FormattedMessage id="english" />
              </a>
            </Link>
          ),
        },
      ]}
    />
  );
};

export default SelectLang;
