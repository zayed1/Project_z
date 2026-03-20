// ============================================
// متحكم المستخدمين | Users Controller
// ============================================
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase');

// تسجيل مستخدم جديد | Register new user
async function register(req, res) {
  try {
    const { email, username, password, role } = req.body;

    // التحقق من البيانات المطلوبة | Validate required fields
    if (!email || !username || !password) {
      return res.status(400).json({
        error: true,
        message: 'البريد الإلكتروني واسم المستخدم وكلمة المرور مطلوبة | Email, username and password are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: true,
        message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل | Password must be at least 6 characters',
      });
    }

    // التحقق من عدم وجود المستخدم مسبقاً | Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .or(`email.eq.${email},username.eq.${username}`)
      .single();

    if (existingUser) {
      return res.status(409).json({
        error: true,
        message: 'البريد الإلكتروني أو اسم المستخدم مستخدم بالفعل | Email or username already taken',
      });
    }

    // تشفير كلمة المرور | Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // إنشاء المستخدم | Create user
    const userRole = role === 'admin' ? 'admin' : 'listener';
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        email,
        username,
        password_hash: passwordHash,
        role: userRole,
      })
      .select('id, email, username, role, created_at')
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({
          error: true,
          message: 'البريد الإلكتروني أو اسم المستخدم مستخدم بالفعل | Email or username already taken',
        });
      }
      throw error;
    }

    // إنشاء JWT Token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: 'تم التسجيل بنجاح | Registration successful',
      user: newUser,
      token,
    });
  } catch (err) {
    console.error('خطأ في التسجيل | Registration error:', err.message);
    res.status(500).json({
      error: true,
      message: 'حدث خطأ أثناء التسجيل | Registration failed',
    });
  }
}

// تسجيل الدخول | Login
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: true,
        message: 'البريد الإلكتروني وكلمة المرور مطلوبة | Email and password are required',
      });
    }

    // البحث عن المستخدم | Find user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({
        error: true,
        message: 'بيانات الدخول غير صحيحة | Invalid credentials',
      });
    }

    // التحقق من كلمة المرور | Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: true,
        message: 'بيانات الدخول غير صحيحة | Invalid credentials',
      });
    }

    // إنشاء JWT Token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'تم تسجيل الدخول بنجاح | Login successful',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.error('خطأ في تسجيل الدخول | Login error:', err.message);
    res.status(500).json({
      error: true,
      message: 'حدث خطأ أثناء تسجيل الدخول | Login failed',
    });
  }
}

// جلب بيانات المستخدم الحالي | Get current user profile
async function getProfile(req, res) {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, username, role, created_at, updated_at')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({
        error: true,
        message: 'المستخدم غير موجود | User not found',
      });
    }

    res.json({ user });
  } catch (err) {
    console.error('خطأ في جلب البيانات | Profile error:', err.message);
    res.status(500).json({
      error: true,
      message: 'حدث خطأ في جلب بيانات المستخدم | Failed to get profile',
    });
  }
}

module.exports = { register, login, getProfile };
