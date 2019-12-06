import { fetchData } from '../../utils';
import { DEV_URL, PRD_URL} from '../../Constants';

const URL = (process.env.NODE_ENV === 'development' ? DEV_URL : PRD_URL);

const fetchQuant = (callback) => {
    const fullURL = URL + '/api/quant';
    console.log(fullURL);
    
    fetchData(fullURL, (data, error) => {
        if (!error && data.length == 2) {
          // console.log(JSON.parse(data[1]))
          callback && callback({
            quant: data[0],
            msoa: JSON.parse(data[1])
          })
        } else {
          console.log(error);
        }
      })
}

export {
    fetchQuant
}