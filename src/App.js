import "./App.css";
import { Home, Post, AuthorDashboard, CreatePost, EditPost } from './pages'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import NavBar from './components/NavBar';


function App() {

  return (
    <div className='App'>
      <Router>
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/post/:id" element={<Post />} />
          <Route path="/edit-post/:id" element={<EditPost />} />
          <Route path="/author-dashboard/:author" element={<AuthorDashboard />} />
          <Route path="/edit-profile/:author" element={<AuthorDashboard />} />
          <Route path="/create-post" element={<CreatePost />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
