import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import CategoryForm from './components/CategoryForm';
import './App.css';
import ArticleForm from './components/Articleform';
import CommentForm from './components/Commentform';
import SubcategoryForm from './components/Subcategoryform';
import HomePageNew from './Pages/HomepageNew';
import ArticleDetail from './Pages/ArticleDetail';
import AdminUsers from './Pages/AdminUsers';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePageNew />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/create-category" element={<CategoryForm />} />
          <Route path="/create-sub-category" element={<SubcategoryForm />} />
          <Route path="/create-article" element={<ArticleForm />} />
          <Route path="/create-comment" element={<CommentForm />} />
          <Route path="/article/:id" element={<ArticleDetail />} />
          <Route path="/admin/users" element={<AdminUsers />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;