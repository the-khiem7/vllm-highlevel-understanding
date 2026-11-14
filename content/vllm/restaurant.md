# vLLM - Brainstorm nội dung thuyết trình

Trạng thái: nội dung đã duyệt; deck HyperFrames dựng tại `slide/vllm/restaurant/` (build: `node slide/vllm/restaurant/src/build.mjs`).

| Thông số | Giá trị |
|---|---|
| Khán giả | Người không chuyên về AI - đã dùng chatbot, chưa biết bên trong hoạt động thế nào |
| Thời lượng | 25 phút (khoảng 22 phút trình bày + 3 phút hỏi đáp) |
| Số slide | 23 slide, tất cả nằm trên mạch trình bày chính (không slide nào ẩn sau nút bấm) |

## 1. Thông điệp chính

Một câu: vLLM giúp một máy chạy AI phục vụ được nhiều người hơn nhiều lần nhờ hai mẹo - xếp chỗ thông minh (PagedAttention) và mời khách vào ngay khi có chỗ trống (Continuous batching).

| # | Điều cần nhớ | Ẩn dụ đi kèm |
|---|---|---|
| 1 | Chạy AI cho nhiều người bị nghẽn vì thiếu chỗ nhớ, không phải vì máy tính chậm | Nhà hàng hết bàn dù bếp còn rảnh |
| 2 | PagedAttention chia chỗ nhớ thành ô nhỏ, cần đến đâu cấp đến đó | Bàn nhỏ ghép linh hoạt + sơ đồ chỗ ngồi của lễ tân |
| 3 | Continuous batching cho người mới vào ngay khi có người xong | Bàn trống là mời khách kế tiếp ngồi ngay |

## 2. Quy tắc cho khán giả không chuyên

| Quy tắc | Cách làm |
|---|---|
| Thuật ngữ | Mỗi từ kỹ thuật xuất hiện kèm "tên đời thường" ngay lần đầu: token = mẩu chữ, KV cache = sổ nháp, GPU = bếp, batch = lượt khách, throughput = số khách phục vụ mỗi giờ |
| Từ bị loại | Không nói: attention head, vector, tham số tính bằng chiều, copy-on-write, iteration-level scheduling (chỉ ghi nhỏ ở chân slide cho ai tò mò) |
| Số liệu | Luôn dịch ra so sánh dễ hình dung ("gấp 24 lần" thay vì "24x"; "1,6 GB cỡ một bộ phim") |
| Tương tác | Một slide câu đố (slide 9) để khán giả tự nghĩ ra giải pháp trước khi xem |
| Nhắc lại | Slide 19 đặt "trước" và "sau" cạnh nhau để chốt lại toàn bộ câu chuyện |

## 3. Ẩn dụ xuyên suốt: "Nhà hàng GPU"

| Khái niệm kỹ thuật | Trong nhà hàng |
|---|---|
| GPU | Nhà hàng có bếp rất mạnh nhưng mặt bằng nhỏ |
| Trọng số mô hình | Bếp và thiết bị - cố định, chiếm sẵn phần lớn mặt bằng |
| KV cache | Bàn ghế cho khách đang ăn (chỗ để "sổ nháp" của từng cuộc trò chuyện) |
| Request | Một nhóm khách |
| Token | Từng món được mang ra |
| Cấp phát liền khối kiểu cũ | Đặt nguyên một bàn dài 2048 ghế cho mỗi nhóm, dù nhóm chỉ có vài người |
| Block | Bàn nhỏ 16 ghế, kê ở bất cứ đâu còn trống |
| Block table | Sơ đồ chỗ ngồi trong tay lễ tân |
| Static batching | Chỉ mời lượt mới khi cả lượt cũ ăn xong |
| Continuous batching | Bàn nào xong là mời nhóm kế tiếp ngồi ngay |

## 4. Content TOC

| Slide | Phần | Tiêu đề | Thời lượng | Ý tưởng minh họa (motion) |
|---|---|---|---|---|
| 1 | Mở đầu | vLLM: Phục vụ AI nhanh hơn, rẻ hơn | 0:30 | Dòng chữ chạy như máy đánh chữ rồi gom lại thành logo "vLLM" |
| 2 | 1. vLLM là gì? | Khi bạn gõ câu hỏi cho chatbot... | 1:00 | Ô chat: tin nhắn bay qua mạng vào một tòa nhà máy chủ; hàng nghìn tin nhắn khác bay vào cùng lúc |
| 3 | 1. vLLM là gì? | vLLM là gì? | 1:15 | Nhiều người -> khối "vLLM" như một quầy lễ tân -> bếp GPU -> chữ chảy ra; chip "Miễn phí, mã nguồn mở", "UC Berkeley 2023", "Nói chuyện giống OpenAI" |
| 4 | 1. vLLM là gì? | AI viết từng mẩu chữ một | 1:00 | Câu trả lời mọc ra từng token có viền màu, đếm "token thứ 1, 2, 3..." |
| 5 | 1. vLLM là gì? | Cuốn sổ nháp của AI | 1:00 | Mỗi token mới viết thêm một dòng vào cuốn sổ nháp (KV cache) đang dày lên |
| 6 | 2. Vấn đề bộ nhớ | Bếp mạnh, nhưng ít bàn | 1:00 | Mặt bằng nhà hàng nhìn từ trên xuống: bếp (trọng số) chiếm 65%, phần bàn còn lại nhỏ |
| 7 | 2. Vấn đề bộ nhớ | Sổ nháp phình to rất nhanh | 1:15 | Cuốn sổ dày dần, thanh bộ nhớ đầy lên, dấu "HẾT CHỖ" đóng xuống |
| 7b | 2. Vấn đề bộ nhớ | 1,6 GB lớn cỡ nào? | 0:30 | Biểu tượng bộ phim HD đặt cạnh một cuộc trò chuyện dài: hai cái ngang nhau |
| 8 | 2. Vấn đề bộ nhớ | Đặt chỗ kiểu cũ: phí 60-80% | 1:30 | Nhà hàng nhìn từ trên: mỗi nhóm giữ bàn dài, ghế có người tô màu, ghế trống gạch đỏ; bộ đếm chạy tới "60-80%" |
| 9 | Câu đố | Nếu bạn là chủ nhà hàng? | 1:00 | Dấu chấm hỏi lớn nhấp nháy, ba gợi ý mờ hiện dần |
| 10 | 3. PagedAttention | Bàn nhỏ + sơ đồ chỗ ngồi | 1:30 | Bàn dài vỡ thành bàn nhỏ bay vào chỗ trống rải rác; sơ đồ lễ tân nối từng nhóm tới bàn của họ bằng đường cong màu |
| 11 | 3. PagedAttention | Cần đến đâu, cấp đến đó | 1:15 | Fragment 1: khách đông thêm thì kê thêm một bàn nhỏ; fragment 2: hai câu trả lời cho cùng một câu hỏi dùng chung phần đầu của sổ |
| 12 | 3. Kết quả 1 | Kết quả: gần như không phí chỗ | 1:00 | Nhà hàng ở slide 8 hiện lại, kín người; ba thẻ số: "dưới 4% phí", "gấp 2-4 lần khách", "tiết kiệm tới 55%" |
| 13 | 4. Vấn đề xếp hàng | Đợi người ăn chậm nhất | 1:15 | Bốn làn bàn ăn theo thời gian (Gantt): nhóm ăn nhanh xong sớm, bàn trống xám; hàng khách đứng chờ ở cửa dài ra |
| 14 | 4. Vấn đề xếp hàng | Cái giá của việc chờ | 1:00 | Đồng hồ của một khách mới quay mãi; nhãn "% thời gian bếp ngồi chơi" trên các ô xám |
| 15 | 5. Continuous batching | Có bàn trống là mời ngay | 1:15 | Cùng Gantt, nhóm mới trượt vào ngay khi một bàn trống; ô xám biến mất, hàng chờ ngắn lại |
| 16 | 5. Kết quả 2 | Kết quả: phục vụ gấp nhiều lần | 1:00 | Hai Gantt cạnh nhau, ba thanh "khách mỗi giờ": kiểu cũ 1 lần, mời liên tục 8 lần, cộng xếp chỗ vLLM 23 lần |
| 17 | 6. Kết hợp | Hai bánh răng ăn khớp | 1:15 | Hai bánh răng "Xếp chỗ thông minh" và "Mời khách liên tục" quay ăn khớp, vòng mũi tên chạy quanh |
| 18 | 6. Kết hợp | Hành trình của một câu hỏi | 1:30 | Step-through 5 fragment: chấm sáng đi qua Cửa -> Lễ tân -> Bàn -> Món ra -> Trả bàn |
| 19 | 6. Kết hợp | Trước và sau vLLM | 1:00 | Hai nhà hàng cạnh nhau: trái lộn xộn, ghế trống, hàng dài; phải kín chỗ, không hàng chờ |
| 20 | 7. Khi nào dùng | Khi nào nên dùng vLLM? | 1:30 | Hai cột thẻ xanh/vàng; chip ứng dụng: Chatbot nội bộ, Hỏi đáp tài liệu, Trợ lý lập trình, Dịch vụ AI dùng chung |
| 21 | 7. Kết luận | Ba điều mang về | 1:00 | Ba thẻ lật lần lượt; terminal gõ `vllm serve <model>` |
| 22 | Kết | Cảm ơn và hỏi đáp | 3:00 | Logo trở lại thành dòng chữ chạy, câu "Bạn hỏi, AI... à không, mình trả lời" |

Tổng khoảng 25 phút.

## 5. Guideline dựng slide

| Hạng mục | Quy tắc |
|---|---|
| Phong cách | Nền tối sâu, hình minh họa vector phẳng có ánh sáng nhẹ; nhà hàng nhìn từ trên xuống (isometric nhẹ) là hình nền chung của các phần 2-6 |
| Chữ | Tối thiểu 40 px ở 1920x1080; tiêu đề ngắn, một ý mỗi slide |
| Màu ngữ nghĩa | Mỗi nhóm khách một màu cố định cả bài; đỏ gạch chéo = phí chỗ; xám = bếp ngồi chơi; xanh lá = đang được dùng |
| Tái sử dụng hình | Nhà hàng (slide 8 -> 12 -> 19) và Gantt (slide 13 -> 15 -> 16) là cùng một hình được biến đổi |
| Motion | Entrance chạy thật khi chuyển slide; vòng lặp nền nhẹ (chữ chạy, bánh răng quay); mỗi fragment là một trạng thái tĩnh nhìn đúng khi tua thẳng tới |
| Số liệu | Ghi nguồn nhỏ ở chân slide; kiểm chứng toàn bộ trước khi dựng (mục 7) |
| Speaker notes | Script mục 6 đặt vào `notes` của từng slide |

## 6. Script thuyết trình (tiếng Việt)

### Slide 1 - Tiêu đề

Xin chào mọi người. Hôm nay mình sẽ kể một câu chuyện về vLLM - một công cụ giúp chạy AI nhanh hơn và rẻ hơn rất nhiều. Đừng lo nếu bạn chưa từng nghe tên nó: mình sẽ không dùng công thức nào, chỉ có một nhà hàng và vài nhóm khách.

### Slide 2 - Khi bạn gõ câu hỏi cho chatbot...

Mọi người chắc đã từng hỏi ChatGPT hay một chatbot nào đó. Bạn gõ câu hỏi, bấm gửi, và vài giây sau chữ bắt đầu hiện ra. Nhưng cùng lúc đó, có hàng nghìn, thậm chí hàng triệu người khác cũng đang bấm gửi. Tất cả câu hỏi đó chạy về những máy tính đặc biệt rất đắt tiền. Câu hỏi hôm nay là: làm sao để mỗi máy như vậy phục vụ được thật nhiều người, mà không ai phải chờ lâu?

### Slide 3 - vLLM là gì?

vLLM chính là một câu trả lời cho câu hỏi đó. Nó là một phần mềm miễn phí, mã nguồn mở, ra đời năm 2023 từ một nhóm nghiên cứu ở Đại học UC Berkeley. Hãy hình dung nó như người quản lý của một nhà hàng: khách - tức các câu hỏi - đến, vLLM sắp xếp chỗ ngồi, đưa yêu cầu cho bếp - tức con chip GPU - và mang câu trả lời ra. Nó còn "nói chuyện" theo đúng cách của OpenAI, nên ứng dụng nào đang dùng ChatGPT có thể chuyển sang một AI tự chạy trong công ty mà gần như không phải sửa gì. Vậy vì sao nó lại nhanh? Ta cần biết AI viết chữ ra sao.

### Slide 4 - AI viết từng mẩu chữ một

Khi trả lời, AI không viết cả câu một lần. Nó viết từng mẩu chữ một - người ta gọi mỗi mẩu là một token. Một token có thể là một từ, nửa từ, hay một dấu câu. Đó là lý do bạn thấy chữ hiện ra từ từ trên màn hình: AI thật sự đang viết từng mẩu.

### Slide 5 - Cuốn sổ nháp của AI

Để viết mẩu tiếp theo cho đúng, AI phải nhớ mọi thứ đã viết trước đó. Thay vì đọc lại từ đầu mỗi lần, nó ghi chú vào một cuốn sổ nháp. Dân kỹ thuật gọi cuốn sổ này là KV cache. Mỗi mẩu chữ viết ra là thêm một dòng vào sổ. Câu trả lời càng dài, cuốn sổ càng dày. Và mỗi người đang trò chuyện cần một cuốn sổ riêng.

### Slide 6 - Bếp mạnh, nhưng ít bàn

Giờ nhìn vào nhà hàng của chúng ta - con chip GPU. Bếp của nó cực mạnh. Nhưng mặt bằng thì nhỏ. Riêng bếp - tức bản thân mô hình AI - đã chiếm khoảng 65% diện tích. Phần còn lại mới dành để kê bàn cho khách, tức là chỗ để những cuốn sổ nháp.

### Slide 7 - Sổ nháp phình to rất nhanh

Và những cuốn sổ này nặng hơn ta tưởng. Với một mô hình cỡ trung bình, mỗi mẩu chữ tốn khoảng 800 KB bộ nhớ. Một cuộc trò chuyện dài có thể cần tới 1,6 GB. Phần chỗ cho khách chỉ khoảng 12 GB, nên chỉ khoảng bảy cuộc trò chuyện dài là đã kín chỗ. Bếp vẫn còn rảnh, nhưng nhà hàng đã hết bàn. Mà 1,6 GB là lớn cỡ nào?

### Slide 7b - 1,6 GB lớn cỡ nào?

Để dễ hình dung: một cuộc trò chuyện dài trong sổ nháp của AI nặng ngang một bộ phim HD tải về máy. Mà máy phải giữ nhiều "bộ phim" như vậy cùng lúc.

### Slide 8 - Đặt chỗ kiểu cũ: phí 60-80%

Tệ hơn, chỗ ít ỏi đó lại bị dùng rất phí. Trước vLLM, khi một nhóm khách bước vào, nhà hàng không biết họ sẽ ngồi lâu hay gọi nhiều món cỡ nào - vì AI không biết trước câu trả lời dài bao nhiêu. Nên để an toàn, nhà hàng giữ cho mỗi nhóm nguyên một bàn dài cho trường hợp xấu nhất. Phần lớn ghế cứ thế để trống. Người mới đến thì không có chỗ, dù nhìn vào đâu cũng thấy ghế trống. Nhóm nghiên cứu vLLM đo được: từ 60 đến 80% chỗ bị bỏ phí như vậy.

### Slide 9 - Câu đố: Nếu bạn là chủ nhà hàng?

Dừng lại một chút. Nếu bạn là chủ nhà hàng này, bạn sẽ làm gì? (Chờ khán giả trả lời vài giây.) Có thể bạn sẽ nói: đừng giữ bàn dài nữa, dùng bàn nhỏ thôi. Khách đông thêm thì kê thêm bàn. Và nhờ lễ tân ghi lại ai đang ngồi ở đâu. Chúc mừng - bạn vừa nghĩ ra PagedAttention.

### Slide 10 - Bàn nhỏ + sơ đồ chỗ ngồi

Đó chính xác là điều vLLM làm. Thay vì một bàn dài, chỗ nhớ được chia thành những bàn nhỏ, mỗi bàn đủ cho 16 mẩu chữ. Những bàn này có thể nằm rải rác ở bất kỳ đâu còn trống, không cần đứng cạnh nhau. Lễ tân giữ một sơ đồ chỗ ngồi ghi nhóm nào đang ngồi ở những bàn nào. Ý tưởng này vốn đã có từ lâu trong máy tính của chúng ta - cách hệ điều hành quản lý bộ nhớ theo từng "trang" - nên nó có tên là PagedAttention.

### Slide 11 - Cần đến đâu, cấp đến đó

Hai cái lợi đi kèm. Thứ nhất: cần đến đâu, cấp đến đó. Khi bàn đang ngồi đã kín, lễ tân mới kê thêm một bàn nhỏ. Chỗ trống, nếu có, chỉ là vài ghế ở bàn cuối cùng. (Chuyển fragment.) Thứ hai: dùng chung. Khi bạn bấm "tạo lại câu trả lời" hay xin nhiều phiên bản cho cùng một câu hỏi, các phiên bản dùng chung phần đầu của cuốn sổ - chính là câu hỏi của bạn - thay vì mỗi phiên bản chép một bản riêng. Chỉ khi các phiên bản bắt đầu viết khác nhau thì mới tách ra.

### Slide 12 - Kết quả: gần như không phí chỗ

Kết quả: chỗ bị phí giảm từ 60-80% xuống dưới 4%. Cùng một nhà hàng giờ chứa được nhiều khách hơn hẳn, nên số khách phục vụ được tăng gấp 2 đến 4 lần so với những hệ thống tốt nhất lúc đó. Riêng nhờ dùng chung, có trường hợp tiết kiệm thêm tới 55% chỗ. Vấn đề chỗ ngồi coi như đã xong. Nhưng có đủ bàn chưa chắc đã phục vụ tốt.

### Slide 13 - Đợi người ăn chậm nhất

Để bếp làm hiệu quả, nhà hàng phục vụ theo lượt: một nhóm khách vào cùng lúc, bếp nấu cho cả nhóm. Người ta gọi đó là batch. Cách cũ là mời cả lượt vào cùng nhau và chỉ mời lượt mới khi tất cả đã ăn xong. Vấn đề là có người chỉ hỏi "xin chào", mấy giây là xong; có người nhờ viết cả bài luận, rất lâu mới xong. Những bàn đã ăn xong cứ ngồi trống, chờ bàn chậm nhất.

### Slide 14 - Cái giá của việc chờ

Cái giá có hai mặt. Một: bếp bị bỏ không. Những ô xám này là thời gian của một con chip rất đắt bị lãng phí. Hai: khách mới phải đứng chờ ở cửa. Dù bạn chỉ hỏi một câu rất ngắn, bạn vẫn phải đợi cả lượt trước xong - dù trong nhà đã có bàn trống từ lâu.

### Slide 15 - Có bàn trống là mời ngay

Continuous batching sửa đúng chỗ đó. Thay vì chờ cả lượt, cứ mỗi lần bếp ra một món - tức mỗi lần AI viết xong một mẩu chữ - quản lý lại nhìn quanh. Nhóm nào xong thì về, nhóm đang chờ ở cửa được mời vào ngay chỗ trống đó. Không ai phải đợi người ăn chậm nhất nữa. Ý tưởng này được công bố lần đầu năm 2022 trong một nghiên cứu tên là Orca, và vLLM áp dụng nó.

### Slide 16 - Kết quả: phục vụ gấp nhiều lần

Một thử nghiệm của công ty Anyscale năm 2023 cho thấy: chỉ riêng cách mời khách liên tục đã phục vụ được gấp khoảng 8 lần so với cách phục vụ theo lượt kiểu cũ. Cộng thêm cách xếp chỗ thông minh của vLLM, con số lên tới 23 lần. Người đến sau cũng không phải chờ lâu như trước. Bếp gần như lúc nào cũng có việc.

### Slide 17 - Hai bánh răng ăn khớp

Điều hay nhất là hai mẹo này không chỉ cộng vào nhau, mà còn giúp nhau. Bàn nhỏ được trả lại ngay khi một nhóm xong - nên quản lý luôn có chỗ để mời người mới. Ngược lại, việc mời khách liên tục giúp số bàn tiết kiệm được thật sự biến thành nhiều khách hơn. Thiếu một trong hai là hỏng: có bàn mà không mời khách kịp, hoặc mời khách liên tục mà không có bàn.

### Slide 18 - Hành trình của một câu hỏi

Thử đi theo câu hỏi của bạn. Bạn bấm gửi, câu hỏi đứng chờ ở cửa. (Fragment.) Chỉ vài phần nhỏ của giây sau, quản lý thấy có chỗ và mời nó vào. (Fragment.) Lễ tân cấp vài bàn nhỏ, vừa đủ cho câu hỏi. (Fragment.) AI viết từng mẩu chữ, bàn đầy thì kê thêm bàn. (Fragment.) Viết xong, câu hỏi trả lại toàn bộ bàn, và người kế tiếp ngồi vào ngay. Không chờ, không phí chỗ.

### Slide 19 - Trước và sau vLLM

Nhìn lại cả câu chuyện. Bên trái là nhà hàng kiểu cũ: bàn dài phần lớn bỏ trống, bếp lúc bận lúc rảnh, hàng chờ dài ở cửa. Bên phải là nhà hàng có vLLM: bàn nhỏ kín người, bếp lúc nào cũng nấu, cửa gần như không có ai phải đứng chờ. Cùng một mặt bằng, cùng một cái bếp.

### Slide 20 - Khi nào nên dùng vLLM?

Vậy ai nên dùng? vLLM hợp nhất khi một công ty muốn tự chạy AI trên máy của mình - ví dụ vì dữ liệu nhạy cảm không muốn gửi ra ngoài - và có nhiều người dùng cùng lúc. Những ứng dụng hay gặp là chatbot nội bộ, hệ thống hỏi đáp trên tài liệu công ty, trợ lý lập trình, hay một dịch vụ AI dùng chung cho nhiều phòng ban. Còn nếu bạn chỉ dùng một mình trên laptop, hoặc chỉ cần dùng ChatGPT hay các dịch vụ AI có sẵn, thì không cần đến nó - những công cụ nhẹ hơn hoặc chính các dịch vụ đó là đủ.

### Slide 21 - Ba điều mang về

Tóm lại ba điều. Một: chạy AI cho nhiều người bị nghẽn vì thiếu chỗ nhớ, không phải vì máy chậm. Hai: PagedAttention chia chỗ nhớ thành bàn nhỏ, cần đến đâu cấp đến đó. Ba: Continuous batching mời người mới vào ngay khi có người xong. Kết hợp lại, cùng một máy phục vụ được nhiều người hơn nhiều lần. Và với dân kỹ thuật, bắt đầu chỉ cần một dòng lệnh.

### Slide 22 - Cảm ơn và hỏi đáp

Cảm ơn mọi người đã lắng nghe. Lần tới khi thấy chữ hiện ra từng mẩu trên màn hình chatbot, hy vọng bạn sẽ nghĩ đến nhà hàng với những chiếc bàn nhỏ và người quản lý luôn mời khách vào đúng lúc. Mình sẵn sàng nhận câu hỏi.

## 7. Số liệu đã kiểm chứng (2026-11-14)

| Số liệu | Kết quả | Nguồn |
|---|---|---|
| Hệ thống cũ phí 60-80% bộ nhớ KV cache | Đúng (bài báo: chỉ 20,4-38,2% chứa dữ liệu thật) | [Blog vLLM 2023](https://vllm.ai/blog/2023-06-20-vllm#:~:text=existing%20systems%20waste) |
| vLLM phí dưới 4% | Đúng | [Blog vLLM 2023](https://vllm.ai/blog/2023-06-20-vllm#:~:text=with%20a%20mere%20waste%20of%20under%204%25) |
| Mô hình 13B trên A100 40 GB: trọng số khoảng 65%, KV cache gần 30%; 800 KB/token; 1,6 GB/yêu cầu | Đúng | [Kwon et al., SOSP 2023 (PDF)](https://arxiv.org/pdf/2309.06180) - PDF không nhận text fragment; câu gốc: "Approximately 65% of the memory is allocated for the model weights", "the KV cache of a single token demands 800 KB of space" |
| Block mặc định 16 token | Đúng | Cùng PDF: "vLLM sets its default block size as 16." |
| Throughput gấp 2-4 lần FasterTransformer và Orca | Đúng | [arXiv abstract](https://arxiv.org/abs/2309.06180#:~:text=improves%20the%20throughput%20of%20popular%20LLMs%20by%202%2D4) |
| Gấp tới 24 lần HuggingFace, 3,5 lần TGI | Đúng (chưa dùng trên slide) | [Blog vLLM 2023](https://vllm.ai/blog/2023-06-20-vllm#:~:text=vLLM%20achieves%20up%20to%2024x%20higher%20throughput) |
| Dùng chung giảm tới 55% bộ nhớ | Đúng | [Blog vLLM 2023](https://vllm.ai/blog/2023-06-20-vllm#:~:text=cutting%20their%20memory%20usage%20by%20up%20to%2055%25) |
| Continuous batching riêng: gấp 8 lần | Đúng | [Anyscale 2023](https://www.anyscale.com/blog/continuous-batching-llm-inference#:~:text=8x%20throughput%20over%20naive%20batching) |
| Gấp 23 lần là continuous batching cộng tối ưu bộ nhớ của vLLM | Đúng - không phải của riêng continuous batching | [Anyscale 2023](https://www.anyscale.com/blog/continuous-batching-llm-inference#:~:text=Up%20to%2023x%20throughput%20improvement) |
| vLLM ra đời ở UC Berkeley, có server API tương thích OpenAI | Đúng | [Blog vLLM 2023](https://vllm.ai/blog/2023-06-20-vllm#:~:text=vLLM%20has%20been%20developed%20at%20UC%20Berkeley) |
| Orca đề xuất iteration-level scheduling, OSDI 2022 | Đúng | [USENIX OSDI '22](https://www.usenix.org/conference/osdi22/presentation/yu#:~:text=we%20propose%20iteration%2Dlevel%20scheduling) |
| 1,6 GB cỡ một bộ phim HD | So sánh minh họa, không phải số đo; luôn nói "cỡ" | - |
