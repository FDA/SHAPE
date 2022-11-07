import { useHistory, withRouter } from "react-router";
import { useEffect } from "react";
import { App } from '@capacitor/app';
import { environments } from "./utils/Constants";

const AppUrlListener: React.FC<any> = () => {
  const history = useHistory();
  useEffect(() => {
    App.addListener("appUrlOpen", (data: any) => {
      // slug = /tabs/tab2
      if (process.env.NODE_ENV === environments.DEVELOPMENT)
        console.log(`**** in CapApp.listener for appUrlOpe with ${data.url}`);
      const slug = data.url.split(".app").pop();
      if (process.env.NODE_ENV === environments.DEVELOPMENT)
        console.log(`**** Cap App trying to navigate top ${slug}`);
      if (slug) {
        history.push(slug);
      }
      // If no match, do nothing - let regular routing
      // logic take over
    });
  }, [history]);

  return null;
};

export default withRouter(AppUrlListener);
