// وحدة التحكم بغرف الاستماع - Listen Room Controller
// إنشاء وإدارة غرف الاستماع الجماعي - Create and manage group listening rooms

const { supabase } = require('../config/supabase');

/**
 * إنشاء غرفة استماع جديدة - Create a new listen room
 * المسار: POST /api/rooms
 * Route: POST /api/rooms
 */
const createRoom = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, episode_id } = req.body;

    // التحقق من البيانات المطلوبة - Validate required fields
    if (!name || !episode_id) {
      return res.status(400).json({
        success: false,
        message: 'اسم الغرفة ومعرف الحلقة مطلوبان - Room name and episode ID are required'
      });
    }

    // إنشاء الغرفة في قاعدة البيانات - Create room in database
    const { data: room, error } = await supabase
      .from('listen_rooms')
      .insert({
        name,
        episode_id,
        created_by: userId,
        is_active: true,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // إرجاع بيانات الغرفة الجديدة - Return new room data
    return res.status(201).json({
      success: true,
      message: 'تم إنشاء الغرفة بنجاح - Room created successfully',
      data: {
        room_id: room.id,
        ...room
      }
    });
  } catch (error) {
    // خطأ في الخادم - Server error
    console.error('خطأ في إنشاء الغرفة - Room creation error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم - Internal server error'
    });
  }
};

/**
 * جلب قائمة الغرف النشطة - Get list of active rooms
 * المسار: GET /api/rooms
 * Route: GET /api/rooms
 */
const getRooms = async (req, res) => {
  try {
    // جلب الغرف النشطة فقط - Fetch only active rooms
    const { data: rooms, error } = await supabase
      .from('listen_rooms')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // إرجاع قائمة الغرف - Return rooms list
    return res.status(200).json({
      success: true,
      data: {
        rooms: rooms || [],
        total: rooms ? rooms.length : 0
      }
    });
  } catch (error) {
    // خطأ في الخادم - Server error
    console.error('خطأ في جلب الغرف - Rooms fetch error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم - Internal server error'
    });
  }
};

/**
 * جلب تفاصيل غرفة واحدة - Get single room details
 * المسار: GET /api/rooms/:id
 * Route: GET /api/rooms/:id
 */
const getRoom = async (req, res) => {
  try {
    const { id } = req.params;

    // التحقق من وجود المعرف - Validate room ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'معرف الغرفة مطلوب - Room ID is required'
      });
    }

    // جلب تفاصيل الغرفة - Fetch room details
    const { data: room, error } = await supabase
      .from('listen_rooms')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      // إذا لم يتم العثور على الغرفة - If room not found
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'الغرفة غير موجودة - Room not found'
        });
      }
      throw error;
    }

    // إرجاع تفاصيل الغرفة - Return room details
    return res.status(200).json({
      success: true,
      data: room
    });
  } catch (error) {
    // خطأ في الخادم - Server error
    console.error('خطأ في جلب تفاصيل الغرفة - Room details error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم - Internal server error'
    });
  }
};

module.exports = {
  createRoom,
  getRooms,
  getRoom
};
