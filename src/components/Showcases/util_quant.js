import { fetchData } from '../../utils';
import { DEV_URL, PRD_URL} from '../../Constants';

const URL = (process.env.NODE_ENV === 'development' ? DEV_URL : PRD_URL);

const fetchQuant = () => {
    const fullURL = URL + '/api/quant';
    console.log(fullURL);
    
    fetchData(fullURL, (data, error) => {
        if (!error) {
          console.log(data)
        } else {
          console.log(error);
        }
      })
}

export {
    fetchQuant
}