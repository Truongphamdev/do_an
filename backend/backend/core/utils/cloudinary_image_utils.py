from cloudinary.utils import cloudinary_url

def _resolve_public_id(value):
    """
    Trả về public_id string từ value.
    - Nếu value là CloudinaryResource -> lấy .public_id
    - Nếu value là string -> trả về string
    - Nếu value là None -> trả về None
    """
    if value is None:
        return None
    # CloudinaryResource (hoặc object có public_id)
    if hasattr(value, "public_id"):
        return value.public_id
    # fallback: str(...) (nếu value đã là public_id string hoặc URL)
    return str(value)

def build_cloudinary_url(value, **cloudinary_opts):
    """
    Trả về URL (string) hoặc None. Bọc cloudinary_url an toàn.
    cloudinary_opts sẽ chuyển tới cloudinary.utils.cloudinary_url (transformations...)
    """
    public_id = _resolve_public_id(value)
    if not public_id:
        return None
    
    try:
        url, _ = cloudinary_url(public_id, **cloudinary_opts)
        return url
    except Exception:
        # fallback: trả str(public_id) để tránh crash, nhưng thường cloudinary_url sẽ thành công
        try:
            return str(public_id)
        except Exception:
            return None