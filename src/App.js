import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import logo from './logo.svg';
import './App.css';
import * as bootstrap from 'bootstrap';



const api = 'https://api.unsplash.com/search/photos/';
const accessKey = 'lDz_VWJvTpAAh_Scp0Ox-M3m6HY6wXmYSy5SC_XVMZk';

const Card = ({item, getSinglePhotos}) => {
  // eslint-disable-next-line jsx-a11y/anchor-is-valid
  return (<a href="#" className="card" onClick={
    (e) => {
      e.preventDefault();
      getSinglePhotos(item.id);
      console.log("打開: ",item.id);
    }
  }>
    <img src={item.urls.regular} className="card-img-top object-fit-cover" height="600" width="400" alt="#" />
  </a>)
}
const SearchBox = ({ text, onSearchHandler }) => {
  return (<>
    <div className='d-flex align-items-center justify-content-center my-4'>
      <label className='my-2 mx-2 h4' htmlFor='search'>搜尋欄</label>
      <input id='search' className="form-control w-75" type="text" defaultValue={text} onKeyDown={onSearchHandler} />
    </div>
  </>)
}
const Loading = ({ isLoading }) => {
  return (<div className='position-fixed top-0 start-0 bottom-0 end-0 z-3 bg-white bg-opacity-50 justify-content-center align-items-center'
    style={{ display: isLoading ? 'flex' : 'none' }}>

    <div className="spinner-grow text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
    <div className="spinner-grow text-secondary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
    <div className="spinner-grow text-success" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
    <div className="spinner-grow text-danger" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
    <div className="spinner-grow text-warning" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
    <div className="spinner-grow text-info" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
    <div className="spinner-grow text-dark" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>)
}

const App = () => {
  const [text, setText] = useState('請使用英文單字搜尋...');
  const [jasonData, setjasonData] = useState([]);
  const [xRatelimit, setxRatelimit] = useState(50);
  const [isLoading, setIsLoaing] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const currentPage = useRef(1);
  const isLoadindRef = useRef(false);
  const modalRef = useRef(null);
  const myModal = useRef(null);

  const onSearchHandler = (event) => {
    if (event.key === 'Enter') {
      setText(event.target.value);
    }
  }

  const getSinglePhotos = async (id) => {
    try {
      const api = 'https://api.unsplash.com/photos/';
      const res = await axios.get(`${api}${id}?client_id=${accessKey}`);
      console.log(res);
      setPhotoUrl(res.data.urls.regular);
      myModal.current.show();
    } catch (error) {
      console.log(error);
    }

  }

  const getPhotos = async (page = 1, isNew = true) => {
    try {
      isLoadindRef.current = true;
      setIsLoaing(true);
      const res = await axios.get(`${api}?client_id=${accessKey}&page=${page}&query=${text}`);
      console.log(res);
      setjasonData((preData) => {
        console.log("資料更新完畢，搜尋項目: ", text);
        if (isNew) {
          return [...res.data.results];
        }
        else {
          return [...preData, ...res.data.results];
        }
      });
      currentPage.current = page;
      setxRatelimit(res.headers['x-ratelimit-remaining']);
      setTimeout(() => {
        isLoadindRef.current = false;
        setIsLoaing(false);
      }, 1500)
    } catch (error) {
      console.log(error);
    }
  }
  const listRef = useRef(null);
  useEffect(() => {
    getPhotos(1, true);
    const scrollEvent = () => {
      const height = (listRef.current.offsetTop + listRef.current.offsetHeight) - window.innerHeight;
      if (!isLoadindRef.current && window.scrollY > height) {
        currentPage.current++;
        getPhotos(currentPage.current, false);
      }
    }
    window.addEventListener('scroll', scrollEvent);
    return () => {
      window.removeEventListener('scroll', scrollEvent);
    }
  }, [text]);

  useEffect(() => {
    const body = document.querySelector('body');
    if (isLoading) {
      body.style.overflow = 'hidden';
    }
    else {
      body.style.overflow = 'auto';
    }
  }, [isLoading]);

  useEffect(() => {
    myModal.current = new bootstrap.Modal(modalRef.current);
  }, []);

  return (<>
    <Loading isLoading={isLoading} />
    <SearchBox text={text} onSearchHandler={onSearchHandler} />
    <p className='text-center h4'>剩餘請求次數: {xRatelimit}</p>
    <hr className='my-4' />
    <div className='row row-cols-2 g-3' ref={listRef}>
      {jasonData.map((item) => {
        return (<div className='col' key={item.id}>
          <Card item={item} getSinglePhotos={getSinglePhotos} />
        </div>)
      })}
    </div>
    <div className="modal" tabIndex="-1" ref={modalRef}>
      <div className="modal-dialog">
       <img src={photoUrl} alt='#' width="100%" />
      </div>
    </div>
  </>);
}

export default App;
