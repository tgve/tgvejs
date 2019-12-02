import { fetchData } from '../../utils';

const fetchQuant = () => {
    fetchData(
        'https://github.com/layik/eAtlas/releases/download/0.0.1/quant_50_msoa.geojson',
        (json) => {
            console.log(json)
        })
}

export {
    fetchQuant
}