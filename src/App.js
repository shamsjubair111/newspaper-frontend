import React from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ConsentBanner from './components/ConsentBanner';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import MyBookmarks from './Pages/MyBookmarks';
import MyComments from './Pages/MyComments';
import CategoryForm from './components/CategoryForm';
import './App.css';
import ArticleForm from './components/Articleform';
import CommentForm from './components/Commentform';
import SubcategoryForm from './components/Subcategoryform';
import HomePageNew from './Pages/HomepageNew';
import ArticleDetail from './Pages/ArticleDetail';
import AdminUsers from './Pages/AdminUsers';
import AdminArticles from './Pages/AdminArticles';
import AdminCategories from './Pages/AdminCategories';
import AdminSubcategories from './Pages/AdminSubcategories';
import CategoryPage from './Pages/CategoryPage';

function App() {
  return (
    <LanguageProvider>
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePageNew />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/my-comments" element={<MyComments />} />
          <Route path="/my-bookmarks" element={<MyBookmarks />} />
          <Route path="/create-article" element={<ArticleForm />} />
          <Route path="/create-category" element={<CategoryForm />} />
          <Route path="/create-sub-category" element={<SubcategoryForm />} />
          <Route path="/create-comment" element={<CommentForm />} />
          <Route path="/article/:id" element={<ArticleDetail />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/articles" element={<AdminArticles />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/subcategories" element={<AdminSubcategories />} />
          {/* Wildcard category routes — MUST be absolutely last */}
          <Route path="/:categoryName/:subcategoryName" element={<CategoryPage />} />
          <Route path="/:categoryName" element={<CategoryPage />} />
        </Routes>
        <Footer />
        <ConsentBanner />
      </div>
    </Router>
    </LanguageProvider>
  );
}

export default App;