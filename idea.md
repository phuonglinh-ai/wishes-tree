# SUPER PROMPT: Website “Cây lời chúc”

## 1. Mục tiêu

Xây dựng website “Cây lời chúc” cho học sinh lớp 5 kết thúc bậc tiểu học.

Ý tưởng:

- Một cây lớn ở trung tâm màn hình.
- Mỗi lời chúc là một chiếc lá.
- Hover/click vào lá để xem lời chúc.
- Có form gửi lời chúc.
- Lời chúc mới được lưu vào Supabase.
- Chỉ lời chúc đã duyệt mới hiển thị công khai.
- Có trang admin đơn giản để duyệt/ẩn/xóa lời chúc.

---

## 2. Công nghệ

Sử dụng:

- Next.js App Router
- TypeScript
- Vercel
- Supabase
- CSS thường hoặc CSS Modules

Không sử dụng:

- Prisma
- NextAuth
- Redux
- CMS phức tạp
- UI framework nặng

---

## 3. Kiến trúc thư mục

```text
/src
  /app
    layout.tsx
    page.tsx
    globals.css

    /admin
      page.tsx

    /api
      /wishes
        route.ts
      /wishes/[id]
        route.ts

  /components
    WishTree.tsx
    WishLeaf.tsx
    WishTooltip.tsx
    WishForm.tsx
    AdminWishTable.tsx

  /lib
    supabaseClient.ts
    supabaseServer.ts
    validators.ts

  /types
    wish.ts
```

---

## 4. Database Supabase

Tạo bảng `wishes`.

```sql
create table wishes (
  id uuid primary key default gen_random_uuid(),
  sender_name text not null,
  student_name text,
  message text not null,
  leaf_color text default 'green',
  position_x numeric,
  position_y numeric,
  status text not null default 'pending',
  created_at timestamptz default now()
);
```

Trạng thái:

```text
pending   = chờ duyệt
approved  = đã duyệt, hiển thị trên cây
hidden    = bị ẩn
```

---

## 5. Biến môi trường

Tạo file `.env.local`.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_PASSWORD=
```

Nguyên tắc:

- Client chỉ dùng public key.
- Server API dùng service role key.
- Không để service role key lộ ra client.
- Admin dùng mật khẩu đơn giản qua `ADMIN_PASSWORD`.

---

## 6. Trang chính `/`

Gồm các phần:

### Hero

Nội dung gợi ý:

```text
Cây lời chúc
Tạm biệt tiểu học, chào hành trình mới
Mỗi chiếc lá là một lời yêu thương gửi tới các con trong ngày khép lại những năm tháng tiểu học.
```

### Cây lời chúc

Yêu cầu:

- Cây lớn ở giữa màn hình.
- Có thân cây, tán cây bằng CSS/SVG đơn giản.
- Lời chúc `approved` được render thành lá.
- Lá có vị trí `position_x`, `position_y`.
- Nếu chưa có vị trí, tự sinh vị trí ổn định dựa trên index/id.
- Lá có animation nhẹ.
- Lá không che kín nhau quá nhiều.

Tương tác desktop:

- Hover/click vào lá để hiện tooltip.
- Tooltip nằm cạnh lá.
- Nếu gần mép màn hình, tooltip tự đổi hướng.

Tương tác mobile:

- Click vào lá mở bottom sheet.
- Bottom sheet hiển thị người gửi, người nhận và lời chúc.

### Form gửi lời chúc

Fields:

```text
Tên người gửi *
Tên học sinh / gửi tới
Lời chúc *
Màu lá
```

Validation:

- `sender_name`: bắt buộc, tối đa 80 ký tự.
- `student_name`: không bắt buộc, tối đa 80 ký tự.
- `message`: bắt buộc, 10–300 ký tự.
- `leaf_color`: chọn trong danh sách có sẵn.

Sau khi gửi:

- Insert vào Supabase với `status = pending`.
- Hiển thị thông báo cảm ơn.
- Không hiển thị ngay lời chúc chưa duyệt lên cây.

---

## 7. Trang admin `/admin`

Yêu cầu:

- Có ô nhập mật khẩu admin.
- Nếu đúng mật khẩu thì hiển thị danh sách lời chúc.
- Có thể lưu trạng thái đã nhập mật khẩu trong `sessionStorage`.
- Không cần hệ thống đăng nhập phức tạp.

Bảng admin gồm:

```text
Thời gian gửi
Người gửi
Gửi tới
Lời chúc
Trạng thái
Hành động
```

Hành động:

- Duyệt: `approved`
- Ẩn: `hidden`
- Đưa về chờ duyệt: `pending`
- Xóa: delete sau khi confirm

---

## 8. API Routes

### `GET /api/wishes`

Lấy danh sách lời chúc đã duyệt.

```text
select * from wishes
where status = 'approved'
order by created_at asc
```

### `POST /api/wishes`

Nhận lời chúc mới từ form.

Logic:

- Validate dữ liệu.
- Sanitize text cơ bản.
- Insert với `status = pending`.
- Trả JSON kết quả.

### `GET /api/wishes?admin=1`

Lấy toàn bộ lời chúc cho admin.

Yêu cầu header:

```text
x-admin-password
```

### `PATCH /api/wishes/[id]`

Cập nhật trạng thái lời chúc.

Body:

```json
{
  "status": "approved"
}
```

### `DELETE /api/wishes/[id]`

Xóa lời chúc.

---

## 9. Thiết kế giao diện

Phong cách:

- Ấm áp, trong trẻo, giàu cảm xúc.
- Phù hợp học sinh lớp 5 kết thúc tiểu học.
- Không quá trẻ con.
- Cảm giác như một cuốn lưu bút số.

Màu sắc:

- Xanh lá
- Vàng nắng
- Nâu thân cây
- Nền kem nhạt
- Lá xanh, vàng, cam, hồng nhạt

---

## 10. Responsive

Desktop:

- Cây ở trung tâm.
- Form bên phải hoặc bên dưới.
- Tooltip hiện cạnh lá.

Tablet:

- Cây ở trên.
- Form ở dưới.
- Tooltip nhỏ gọn.

Mobile:

- Lá đủ lớn để chạm.
- Click lá mở bottom sheet.
- Form nằm dưới cây.
- Không để tooltip tràn màn hình.

---

## 11. Animation

Dùng CSS animation đơn giản:

- Lá đung đưa nhẹ.
- Hover lá scale 1.1.
- Form có hiệu ứng nhẹ khi gửi thành công.
- Không dùng animation quá nhiều.

---

## 12. Bảo mật và độ ổn định

Yêu cầu:

- Không render HTML từ user input.
- Không dùng `dangerouslySetInnerHTML`.
- Giới hạn độ dài lời chúc.
- Disable nút gửi khi đang submit.
- Có loading state.
- Có error state.
- Có empty state.
- Không crash nếu Supabase lỗi.
- Không lộ service role key ra client.

---

## 13. Nội dung fallback demo

Nếu database chưa có lời chúc nào, hiển thị lời chúc mẫu local:

```text
Con đã khép lại những năm tháng tiểu học thật đẹp. Mong con luôn giữ trái tim trong sáng, tinh thần ham học hỏi và lòng tin vào chính mình. Chặng đường phía trước sẽ mới mẻ hơn, nhưng bố mẹ tin con sẽ mạnh mẽ, tự tin và tỏa sáng theo cách riêng của con.
```

---

## 14. Tiêu chí hoàn thành

Dự án hoàn thành khi:

- Chạy được bằng `npm run dev`.
- Trang chính hiển thị cây lời chúc.
- Lời chúc approved từ Supabase hiển thị thành lá.
- Hover/click lá hiện lời chúc hợp lý.
- Form gửi lời chúc hoạt động.
- Lời chúc mới vào database với trạng thái pending.
- Trang admin xem được lời chúc.
- Admin duyệt/ẩn/xóa được lời chúc.
- Deploy được lên Vercel.
- Không lộ Supabase service role key.

---

## 15. Các bước triển khai

Thực hiện theo thứ tự:

1. Khởi tạo project Next.js TypeScript.
2. Tạo cấu trúc thư mục.
3. Tạo Supabase helper client/server.
4. Tạo type `Wish`.
5. Tạo API routes.
6. Tạo giao diện cây lời chúc.
7. Tạo form gửi lời chúc.
8. Tạo trang admin.
9. Hoàn thiện responsive và animation.
10. Kiểm tra lỗi, bảo mật, deploy Vercel.

---

## 16. Sau khi code xong, cần cung cấp

- Danh sách file đã tạo/sửa.
- Hướng dẫn tạo bảng Supabase.
- Hướng dẫn cấu hình `.env.local`.
- Hướng dẫn chạy local.
- Hướng dẫn deploy lên Vercel.
- Checklist kiểm tra trước khi gửi link cho phụ huynh.

Hãy bắt đầu xây dựng dự án.
