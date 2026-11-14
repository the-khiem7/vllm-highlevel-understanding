# vLLM - From Memory Bottlenecks to Efficient LLM Serving: khách sạn 48 phòng

Trạng thái: kế hoạch gốc của người trình bày, dựng nguyên văn; deck tại `slide/vllm/llmhotel48/` (build: `node slide/vllm/llmhotel48/src/build.mjs`).

| Thông số | Giá trị |
|---|---|
| Khán giả | AI / Software Engineers |
| Thời lượng | 15-20 phút |
| Số slide | 10, tất cả nằm trên mạch trình bày chính |
| Số người nói | 1 |
| Ngôn ngữ | Slide tiếng Anh; script (ghi chú người nói) tiếng Việt, thuật ngữ kỹ thuật giữ nguyên tiếng Anh |
| Mạch kể | Problem -> Solution -> Result -> Problem -> Solution -> Result -> Integration -> Real-world Impact |

## 1. Thông điệp chính

Một câu: phục vụ nhiều request hơn với cùng tài nguyên GPU nhờ quản lý bộ nhớ hiệu quả và lập lịch request hiệu quả.

| # | Điều cần nhớ | Ẩn dụ đi kèm |
|---|---|---|
| 1 | PagedAttention giải bài toán cấp phát bộ nhớ KV Cache | Chỉ xếp phòng khi khách đến, phòng nào trống cũng được, có sổ ghi phòng |
| 2 | Continuous Batching giải bài toán lập lịch request | Một đoàn trả phòng thì đoàn đang chờ vào ngay |
| 3 | vLLM kết hợp hai cơ chế | Cùng 48 phòng, phục vụ được nhiều đoàn hơn |

## 2. Quy tắc cho khán giả

| Quy tắc | Cách làm |
|---|---|
| Thuật ngữ | Khán giả là kỹ sư: dùng thẳng thuật ngữ (KV Cache, Block Table, batching); ẩn dụ chỉ dẫn dắt, không thay tên kỹ thuật |
| Số liệu | Chỉ có số của ví dụ khách sạn, đặt để dễ hình dung; không có số đo thật, không nêu hệ số tăng tốc |

## 3. Ẩn dụ xuyên suốt: khách sạn 48 phòng

| Khái niệm kỹ thuật | Trong khách sạn |
|---|---|
| GPU memory dành cho KV Cache | 48 phòng |
| Request | Một đoàn du lịch (Tour) |
| Độ dài sequence tối đa | Số phòng đoàn xin đặt tối đa |
| Độ dài sequence thực tế | Số phòng đoàn thật sự dùng |
| KV Cache block | Một phòng |
| Block Table | Sổ ghi đoàn nào ở phòng nào |
| Static batching | Chỉ nhận đoàn mới khi cả nhóm đã trả phòng |
| Continuous batching | Đoàn nào trả phòng thì đoàn chờ vào ở iteration kế tiếp |
| Request Scheduler | Lễ tân quyết định đoàn nào được vào |

### Số liệu minh họa

Mọi số do kế hoạch đặt, không phải số đo. Slide 2: Tour A đặt 10 dùng 6, Tour B đặt 8 dùng 3, Tour C đặt 7 chưa đến; có người ở 6 + 3 = 9, đặt trước nhưng trống (10-6) + (8-3) + 7 = 16, hoàn toàn trống 48 - 9 - 16 = 23.

## 4. Content TOC

| Slide | Phần | Tiêu đề | Thời lượng | Hình và chuyển động |
|---|---|---|---|---|
| 1 | Scenario | The 48-Room Hotel: Understanding the Scenario | 1:30 | Sơ đồ 48 phòng hiện dần, ba đoàn khách bay vào kèm quy mô và giờ đến, câu hỏi trung tâm |
| 2 | Problem 1 | 48 Rooms, But Fully Booked? | 2:30 | Sơ đồ 48 phòng tô màu theo trạng thái, từng đoàn đặt phòng, bảng số phòng |
| 3 | Solution 1 | PagedAttention: Rethinking Memory Allocation | 2:30 | Ba luật cạnh nhau, mỗi luật gồm cách cũ, cách mới, ánh xạ kỹ thuật |
| 4 | Result 1 | More Usable Memory, Less Waste | 1:30 | Bảng so sánh trước và sau, bốn kết quả |
| 5 | Problem 2 | Available Rooms, But Guests Still Wait | 2:00 | Timeline: A xong sớm, B và C chạy tiếp, D chờ |
| 6 | Solution 2 | Continuous Batching | 2:00 | Ba iteration: A xong, D thay chỗ A |
| 7 | Result 2 | Keep the GPU Busy | 1:15 | Bảng so sánh static và continuous, thông điệp chính |
| 8 | Integration | PagedAttention + Continuous Batching | 2:15 | Hai khối chức năng và sơ đồ kiến trúc kết hợp, bảng trách nhiệm |
| 9 | Real-world Impact | When Should We Use vLLM? | 1:45 | Ba use case và năm chip kỹ thuật |
| 10 | Conclusion | More Requests, Same GPU Resources | 1:15 | Quay lại khách sạn 48 phòng, bảng ba kết luận |

Tổng khoảng 18 phút.

## 5. Guideline dựng slide

| Mục | Quy định |
|---|---|
| Phong cách | Nền tối, một sơ đồ 48 phòng dùng lại ở slide 1, 2, 10; chữ tối thiểu 40 px |
| Màu có nghĩa | Tour A hồng, Tour B tím, Tour C vàng, Tour D xanh dương; phòng trống xanh lá; ô đặc = đang ở, ô viền nét đứt = đặt trước nhưng trống |
| Chuyển động | Vào cảnh theo từng bước (fragment) và vòng lặp nền khi trình chiếu; hai timeline ở slide 5 và 6 chạy theo từng bước |
| Nội dung | Dựng đúng các thành phần kế hoạch liệt kê, không thêm ý mới |

## 6. Script thuyết trình (tiếng Việt)

### Slide 1 - The 48-Room Hotel: Understanding the Scenario

"Hãy tưởng tượng chúng ta quản lý một khách sạn có 48 phòng.

Mỗi ngày có nhiều đoàn du lịch liên hệ đặt phòng.

Mỗi đoàn có quy mô khác nhau. Có đoàn cần 10 phòng, có đoàn cần 5 phòng.

Nhưng có một chi tiết quan trọng: khách không đến cùng một lúc.

Có đoàn đến lúc 5 giờ chiều, có đoàn đến lúc nửa đêm, và có đoàn không bao giờ đến.

Thử thách của chúng ta rất đơn giản:

Làm sao phục vụ được càng nhiều khách càng tốt mà không xây thêm phòng?

Kịch bản này sẽ giúp chúng ta hiểu hai thách thức lớn trong phục vụ Large Language Model."

Chuyển ý: "Hãy bắt đầu với vấn đề đầu tiên: cấp phát bộ nhớ kém hiệu quả."

### Slide 2 - Problem 1: 48 Rooms, But Fully Booked?

"Khách sạn của chúng ta áp dụng một chính sách đặt phòng kém hiệu quả.

Mỗi khi một đoàn đặt phòng, khách sạn hỏi số phòng tối đa mà họ có thể cần.

Sau đó khách sạn giữ trước toàn bộ số phòng đó.

Ví dụ, Tour A đặt 10 phòng, nhưng thực tế chỉ có 6 phòng có người ở.

Tour B đặt 8 phòng, nhưng chỉ có 3 phòng có người.

Tour C đặt 7 phòng, nhưng khách của họ còn chưa đến.

Kết quả là, dù khách sạn có 48 phòng, chỉ có 9 phòng đang thực sự được dùng.

16 phòng khác được đặt trước nhưng vẫn trống.

Khách sạn vẫn còn 23 phòng hoàn toàn trống, nhưng hệ thống đặt phòng không dùng hiệu quả một phần tài nguyên của mình.

Điều này giống với sự kém hiệu quả của GPU memory khi phục vụ LLM.

Khi một LLM xử lý request, nó phải duy trì một KV Cache (Key-Value Cache), nơi lưu các attention key và value đã tính trước đó để không phải tính lại trong lúc sinh token.

Nếu bộ nhớ được giữ theo độ dài sequence tối đa dự kiến thay vì mức dùng thực tế, một lượng lớn GPU memory có thể bị lãng phí.

Khi số request đồng thời tăng, đây trở thành một nút thắt nghiêm trọng."

Chuyển ý: "Làm sao để ngừng giữ những phòng mà khách có thể không bao giờ dùng?"

### Slide 3 - Solution 1: PagedAttention - Rethinking Memory Allocation

"Để giải quyết bài toán cấp phát bộ nhớ, khách sạn đưa ra ba luật quản lý mới.

Luật đầu tiên rất đơn giản: chỉ xếp phòng khi khách thực sự đến.

Thay vì giữ trước 10 phòng cho Tour A, khách sạn ban đầu chỉ xếp những phòng cần thiết.

Trong LLM serving, bộ nhớ KV Cache được cấp phát theo từng block khi sequence dài ra, thay vì giữ trước toàn bộ dung lượng tối đa.

Luật thứ hai là các phòng không cần liền kề nhau nữa.

Ví dụ, Tour A có thể ở các phòng 2, 8, 15 và 31.

Miễn là các phòng này còn trống, khách sạn có thể xếp cho cùng một đoàn.

Điều này tương tự cách PagedAttention quản lý KV Cache.

Nó chia KV Cache thành các block kích thước cố định và cho phép các block của cùng một request nằm ở những vị trí vật lý khác nhau.

Luật thứ ba là giữ một sổ ghi phòng chi tiết.

Nếu Tour A ở các phòng 2, 8, 15 và 31, khách sạn phải biết chính xác những phòng nào thuộc Tour A.

Trong vLLM, việc này do Block Table đảm nhiệm.

Block Table ánh xạ logical block sang physical block, giúp hệ thống tìm đúng dữ liệu KV Cache dù các block không nằm liền nhau.

Ba ý tưởng này cùng tạo nên nền tảng của PagedAttention."

Chuyển ý: "Khi khách sạn đã đổi chiến lược quản lý, chúng ta kỳ vọng cải thiện được gì?"

### Slide 4 - Result 1: More Usable Memory, Less Waste

"Sau khi áp dụng ba luật này, khách sạn dùng phòng hiệu quả hơn nhiều.

Khách sạn không còn phải giữ trước mọi phòng.

Các phòng trống có thể được xếp linh hoạt, kể cả khi chúng nằm rải rác khắp tòa nhà.

Sổ ghi phòng đảm bảo mỗi đoàn vẫn tìm đúng phòng của mình.

Trong vLLM, PagedAttention mang lại lợi ích tương tự cho GPU memory.

Nó giảm lãng phí bộ nhớ do cấp phát cứng nhắc và phân mảnh, cho phép hệ thống nhận nhiều request đồng thời hơn với cùng dung lượng GPU memory.

Tuy nhiên, giải quyết bài toán bộ nhớ vẫn chưa đủ.

Còn một thách thức nữa."

Chuyển ý: "Dù khách sạn còn đủ phòng, liệu có phục vụ khách hiệu quả nếu quy trình nhận phòng quá chậm?"

### Slide 5 - Problem 2: Available Rooms, But Guests Still Wait

"Chúng ta đã giải quyết xong vấn đề đầu tiên.

Khách sạn giờ có thể cấp phòng hiệu quả.

Nhưng hãy thêm một tình huống khác.

Giả sử khách sạn đang phục vụ ba đoàn: A, B và C.

Tour A kết thúc kỳ nghỉ lúc 6 giờ chiều và trả toàn bộ phòng.

Tuy nhiên, Tour B và Tour C vẫn đang ở khách sạn.

Theo quy trình quản lý truyền thống, khách sạn chờ cả ba đoàn kết thúc rồi mới nhận Tour D.

Dù Tour A đã trả phòng, Tour D vẫn phải chờ.

Đây là một vấn đề lập lịch.

Trong LLM serving, nhiều request được xử lý cùng nhau trong một batch.

Nhưng mỗi request có thể sinh số output token khác nhau.

Một số request kết thúc sớm hơn nhiều so với những request khác.

Với static batching truyền thống, các request thường được giữ trong cùng một batch cho đến khi batch hoàn tất.

Điều này có thể khiến năng lực tính toán bị dùng không hết và buộc request mới phải chờ.

Câu hỏi là:

Có thể thay một request đã xong bằng một request mới mà không phải chờ cả batch kết thúc không?"

Chuyển ý: "Điều này dẫn chúng ta đến cơ chế chính thứ hai của vLLM: Continuous Batching."

### Slide 6 - Solution 2: Continuous Batching

"Khách sạn đưa ra một quy tắc vận hành khác.

Thay vì chờ tất cả các đoàn kết thúc, khách sạn nhận đoàn mới ngay khi một đoàn trả phòng.

Ví dụ, Tour A kết thúc.

Tour B và Tour C vẫn đang ở.

Khách sạn lập tức chuẩn bị nhận Tour D bằng nguồn lực đang trống.

Trong vLLM, cơ chế này gọi là Continuous Batching.

Thay vì chờ cả batch hoàn tất, scheduler quản lý request ở từng iteration.

Khi một request sinh xong output, KV Cache của nó có thể được giải phóng.

Scheduler sau đó có thể nhận một request đang chờ vào ở iteration kế tiếp.

Trong lúc đó, các request còn lại tiếp tục sinh token.

Nhờ vậy engine phục vụ liên tục xử lý request mới thay vì bị bó trong một batch cố định.

Kết quả là GPU được dùng hiệu quả hơn, đặc biệt khi lượng request đồng thời cao."

Chuyển ý: "Vậy cải tiến này thực sự mang lại gì cho hệ thống?"

### Slide 7 - Result 2: Keep the GPU Busy

"Với Continuous Batching, khách sạn không còn phải chờ mọi đoàn kết thúc mới nhận khách mới.

Trong LLM serving, request đã xong có thể được thay bằng request mới ở các iteration tiếp theo.

Điều này tăng tính linh hoạt khi lập lịch và giúp duy trì mức sử dụng GPU cao hơn.

Nhưng hãy nhớ, giờ chúng ta có hai giải pháp riêng biệt.

PagedAttention giải quyết bài toán quản lý bộ nhớ.

Continuous Batching giải quyết bài toán lập lịch request.

Để hiểu giá trị thực sự của vLLM, chúng ta cần xem hai cơ chế này phối hợp với nhau thế nào."

### Slide 8 - The Combination: PagedAttention + Continuous Batching

"Bây giờ hãy kết hợp hai chiến lược quản lý khách sạn.

Giả sử Tour A kết thúc kỳ nghỉ.

Continuous Batching cho phép khách sạn nhận Tour D ở thời điểm lập lịch kế tiếp.

Tuy nhiên, nhận Tour D mới chỉ là một nửa bài toán.

Khách sạn còn phải tìm phòng trống cho Tour D.

Đây là lúc PagedAttention trở nên quan trọng.

PagedAttention cho phép khách sạn dùng các phòng trống một cách linh hoạt, không cần chúng liền kề nhau.

Block Table theo dõi phòng nào thuộc đoàn nào.

Hai cơ chế này bổ sung cho nhau.

Continuous Batching quyết định request nào được xử lý.

PagedAttention quản lý bộ nhớ KV Cache mà các request đó cần.

Cùng nhau, chúng giúp vLLM phục vụ nhiều request đồng thời hơn một cách hiệu quả với tài nguyên GPU sẵn có.

Đây là ý tưởng cốt lõi của vLLM."

### Slide 9 - Real-world Impact: When Should We Use vLLM?

"Trong ứng dụng thực tế, vLLM hữu ích khi chúng ta cần tự triển khai LLM và phục vụ nhiều người dùng cùng lúc.

Ví dụ, một doanh nghiệp có thể triển khai mô hình Qwen hoặc Llama trên hạ tầng GPU của mình.

Nhiều ứng dụng nội bộ, chatbot và AI agent có thể gửi request đến cùng một model server.

Thay vì nạp các bản sao mô hình riêng cho từng ứng dụng, tổ chức có thể dùng vLLM làm inference server tập trung.

vLLM cung cấp OpenAI-compatible API, giúp dễ tích hợp với các ứng dụng đã dùng giao diện API tương thích.

Tuy nhiên, vLLM không phải lúc nào cũng là lựa chọn tốt nhất.

Với việc chạy mô hình cục bộ đơn giản, Ollama có thể tiện hơn.

Với ứng dụng không muốn tự quản lý hạ tầng GPU, managed inference API có thể là lựa chọn tốt hơn.

vLLM đặc biệt có giá trị khi chúng ta cần kiểm soát hạ tầng inference và phục vụ hiệu quả dưới tải đồng thời."

### Slide 10 - Conclusion: More Requests, Same GPU Resources

"Hãy quay lại khách sạn ban đầu.

Chúng ta bắt đầu với 48 phòng, nhưng khách sạn không dùng được tài nguyên của mình một cách hiệu quả.

Chúng ta không xây thêm phòng.

Thay vào đó, chúng ta đổi cách cấp phòng và cách nhận khách.

PagedAttention làm cho việc cấp phát bộ nhớ linh hoạt hơn.

Continuous Batching cho phép request mới vào mà không phải chờ cả batch kết thúc.

Cùng nhau, các cơ chế này cải thiện cách các workload LLM inference dùng tài nguyên GPU.

Đây là ý tưởng chính của vLLM.

Nó không làm GPU lớn hơn về mặt vật lý, cũng không làm mô hình thông minh hơn.

Nó làm cho LLM serving hiệu quả hơn nhờ quản lý bộ nhớ và lập lịch request tốt hơn.

Phục vụ nhiều request hơn với cùng tài nguyên GPU.

Cảm ơn mọi người."

## 7. Số liệu đã kiểm chứng

| Số hoặc khẳng định | Kết quả | Nguồn |
|---|---|---|
| 48, 9, 16, 23 phòng (slide 1, 2, 10) | Số của ví dụ, cộng khớp 48 | Kế hoạch của người trình bày; slide ghi nhãn "Illustrative example" |
| Khẳng định kỹ thuật ở slide 9 (Qwen/Llama, OpenAI-compatible API, tensor parallelism, so sánh Ollama và managed API) | Chưa kiểm chứng độc lập, giữ đúng như kế hoạch | Người trình bày chịu trách nhiệm; không có số đo nên không nêu số trên slide |
