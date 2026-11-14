# vLLM - Script thuyết trình: ví dụ khách sạn 48 phòng

Trạng thái: slide 1-9, 11, 13, 14 sẵn sàng thiết kế; slide 10 (kết quả) và slide 12 (so sánh công cụ) còn chờ kiểm chứng, không chốt số liệu.

| Thông số | Giá trị |
|---|---|
| Khán giả | Người không chuyên về AI - đã dùng chatbot, chưa biết bên trong hoạt động thế nào |
| Thời lượng | Khoảng 17 phút trình bày + 3 phút hỏi đáp |
| Số slide | 14 |
| Thông điệp | vLLM không làm AI thông minh hơn; nó giúp cùng một GPU phục vụ nhiều người hơn nhờ hai ý tưởng: xếp phòng thông minh (PagedAttention) và mời đoàn khách vào liên tục (continuous batching) |
| Ngôn ngữ slide và script | Tiếng Việt; thuật ngữ tiếng Anh chỉ ở chữ nhỏ cuối slide |

## 1. Ẩn dụ xuyên suốt: khách sạn 48 phòng, khách là các đoàn du lịch đặt phòng trước

| Khái niệm kỹ thuật | Trong khách sạn | Ghi chú |
|---|---|---|
| GPU | Khách sạn | Chỗ nhớ có hạn |
| Chỗ nhớ dành cho khách (bộ nhớ còn lại sau khi nạp mô hình) | 48 phòng | Sảnh, bếp, kho - tức bản thân mô hình AI - nằm ngoài 48 phòng, đã chiếm chỗ từ trước |
| vLLM | Quản lý khách sạn | Xếp phòng và quyết định đoàn nào được vào |
| Request (một người dùng gửi câu hỏi) | Một đoàn du lịch đặt phòng trước | Ví dụ: đoàn của An's Tour |
| Độ dài câu trả lời (chưa biết trước) | Quy mô đoàn khi đến nơi | Đoàn nhỏ ở ngắn và cần ít phòng; đoàn lớn ở dài và cần nhiều phòng |
| Token (một mẩu chữ AI viết ra) | Một món đồ đoàn mang thêm vào phòng | |
| KV cache (ghi chú tạm AI cần nhớ) | Đồ đạc của đoàn | Chỉ ghi "KV cache" bằng chữ nhỏ ở slide 4 |
| Block / page | Một phòng, chứa 16 món đồ | Khớp block mặc định 16 token của vLLM |
| Cấp phát liền khối kiểu cũ | Đặt trước một dãy 16 phòng liền nhau cho mỗi đoàn | Vì không biết trước đoàn đông đến đâu, đặt theo mức tối đa có thể |
| PagedAttention | Cấp từng phòng khi cần, phòng ở đâu cũng được, lễ tân giữ sổ phòng | Sổ phòng = block table |
| Một bước sinh chữ của cả nhóm | Một vòng: nhân viên đi qua từng đoàn, mang cho mỗi đoàn một mẩu chữ mới | |
| Static batching (gom nhóm cố định) | Nhận một nhóm đoàn, chỉ nhận nhóm kế khi cả nhóm đã trả phòng | |
| Continuous batching | Sau mỗi vòng, đoàn nào xong thì trả phòng, đoàn đang chờ vào ngay | |

### Số liệu minh họa của ví dụ khách sạn

Mọi số của khách sạn do mình đặt để dễ hình dung, không phải số đo. Slide nào dùng chúng phải có chữ nhỏ "Ví dụ minh họa".

| Số | Giá trị | Cách ra |
|---|---|---|
| Tổng phòng | 48 | Đặt |
| Số phòng mỗi đoàn đặt trước (kiểu cũ) | 16 phòng liền nhau | Đặt: mức tối đa có thể, như An's Tour đặt 16 phòng |
| Số phòng đoàn thật sự dùng (trung bình) | 4 | Đặt: như đoàn của An's Tour chỉ đến 4 phòng |
| Số đoàn ở cùng lúc, kiểu cũ | 3 | 48 / 16 |
| Phòng có người, kiểu cũ | 12 | 3 x 4 |
| Phòng đặt trước nhưng trống, kiểu cũ | 36 (75%) | 48 - 12; nằm trong khoảng 60-80% mà bài báo vLLM nêu |
| Số đoàn ở cùng lúc, PagedAttention | 12 | 48 / 4 |
| Hệ số | gấp 4 lần | 12 / 3; số thật trong bài báo nằm trong khoảng 2-4 lần |
| Số đoàn đến cửa | 100 | Đặt; kiểu cũ 3 vào + 97 chờ, kiểu mới 12 vào + 88 chờ |
| Timeline 3 đoàn ở cùng lúc | A ở 6 vòng, B 2 vòng, C 3 vòng, D 2 vòng, E 2 vòng | Đặt; kiểu cũ xong sau 8 vòng, kiểu mới sau 6 vòng |

## 2. Cấu trúc 5 phần và thời lượng

| Slide | Phần | Tiêu đề | Thời lượng | Trạng thái |
|---|---|---|---|---|
| 1 | Mở đầu | vLLM: Phục vụ nhiều người hơn với cùng một GPU | 0:30 | Sẵn sàng |
| 2 | 1. vLLM là gì? | vLLM là gì - và không phải là gì | 1:00 | Sẵn sàng |
| 3 | 2. Vì sao cần vLLM? | Một đoàn thì dễ. Còn 100 đoàn? | 1:30 | Sẵn sàng |
| 4 | 2. Vì sao cần vLLM? | AI phải nhớ những gì nó đã viết | 1:15 | Sẵn sàng |
| 5 | 2. Vì sao cần vLLM? | Đặt phòng trước: giữ chỗ cho trường hợp tệ nhất | 1:30 | Sẵn sàng |
| 6 | 3. vLLM giải quyết thế nào? | Thay vì đặt trước cả một dãy phòng... | 1:45 | Sẵn sàng |
| 7 | 3. vLLM giải quyết thế nào? | Có phòng rồi, nhưng đợi đoàn ở lâu nhất | 1:15 | Sẵn sàng |
| 8 | 3. vLLM giải quyết thế nào? | Một đoàn ra, một đoàn vào | 1:30 | Sẵn sàng |
| 9 | 3. vLLM giải quyết thế nào? | Hai ý tưởng, một khách sạn đầy khách | 1:15 | Sẵn sàng |
| 10 | 4. Kết quả | Kết quả: hướng cải thiện và số liệu có nguồn | 1:15 | Chờ kiểm chứng |
| 11 | 5. Khi nào dùng? | Khi nào nên (và không cần) dùng vLLM | 1:30 | Sẵn sàng, chờ duyệt |
| 12 | 5. Khi nào dùng? | Công cụ nào hợp tình huống nào? | 1:15 | Chờ kiểm chứng |
| 13 | Kết | Ba điều mang về | 1:00 | Sẵn sàng |
| 14 | Kết | Cảm ơn và hỏi đáp | 3:00 | Sẵn sàng |

Tổng khoảng 20 phút (17 phút trình bày + 3 phút hỏi đáp).

## 3. Script từng slide

Mỗi slide có: nội dung trên slide (ngắn), hình, lời nói, câu chuyển. Chữ trên slide tối đa 3-4 ý; phần giải thích nằm ở lời nói.

### Slide 1 - Tiêu đề

**Trên slide:** "vLLM: Phục vụ nhiều người hơn với cùng một GPU" / phụ đề "Vì sao chạy AI cho nhiều người lại khó - và vLLM giúp thế nào".

**Hình:** Tòa khách sạn nhìn thẳng, 48 ô cửa sổ xếp lưới 6 x 8, đèn sáng dần từng ô rồi gom thành logo "vLLM".

**Lời nói:** Xin chào mọi người. Hôm nay mình kể một câu chuyện về cách chạy AI cho nhiều người dùng cùng lúc, qua một khách sạn có đúng 48 phòng. Không công thức, không code - chỉ có các đoàn khách, những căn phòng và vài quy tắc xếp phòng.

**Chuyển:** "Trước hết, vLLM là gì?"

### Slide 2 - vLLM là gì - và không phải là gì

**Trên slide:**

- Không phải một mô hình AI mới.
- Không dùng để huấn luyện AI.
- Là hệ thống giúp chạy và phục vụ AI hiệu quả hơn.

**Hình:**

```text
Người dùng  →  vLLM  →  AI chạy trên GPU  →  Câu trả lời
              (quản lý khách sạn)
```

Chữ nhỏ cuối slide: "Mã nguồn mở, bắt đầu từ UC Berkeley, 2023".

**Lời nói:** Mình nói trước vLLM không phải là gì, để khỏi hiểu nhầm. Nó không phải một AI mới như ChatGPT hay Gemini, và nó cũng không dùng để dạy AI. Nó là phần mềm đứng giữa người dùng và AI đã có sẵn. Cứ hình dung AI là dịch vụ của một khách sạn, còn vLLM là người quản lý: nhận đoàn khách, xếp phòng, quyết định đoàn nào vào lúc nào. Quản lý giỏi không làm khách sạn đẹp hơn, nhưng làm cho cùng một khách sạn đón được nhiều đoàn hơn. Điều đó nghe đơn giản, nhưng nó khó hơn ta tưởng - vì sao thì xem slide sau.

**Chuyển:** "Câu hỏi là: vì sao đón khách lại khó?"

### Slide 3 - Một đoàn thì dễ. Còn 100 đoàn?

**Trên slide:**

- Nhiều người gửi câu hỏi cùng lúc.
- Câu hỏi và câu trả lời dài ngắn khác nhau.
- GPU và bộ nhớ có hạn.
- Xử lý kém: người dùng chờ lâu, GPU bị lãng phí.

**Hình:** Hai trạng thái. Trái: một đoàn nhỏ đứng trong sảnh, 48 phòng đều trống, chữ "1 người dùng: dễ". Phải: 100 đoàn xếp hàng trước cửa, 48 ô cửa sổ, chữ "100 người dùng: ?". Chữ nhỏ: "Ví dụ minh họa".

**Lời nói:** Nếu chỉ có một người hỏi AI thì dễ: cả khách sạn chỉ có một đoàn, muốn phòng nào cũng được. Nhưng ngoài đời không ai đến một mình. Hãy hình dung khách sạn của chúng ta có đúng 48 phòng, và 100 đoàn du lịch cùng đến cửa một lúc. Đó là một máy chủ AI vào giờ cao điểm: 48 phòng là phần chỗ nhớ có hạn trên con chip GPU, còn 100 đoàn là 100 người cùng gửi câu hỏi. Chuyện khó ở hai điểm. Thứ nhất, các đoàn rất khác nhau: có đoàn nhỏ ở ngắn - chỉ chào một câu - có đoàn lớn ở dài - nhờ viết cả bài luận. Thứ hai, mỗi đoàn mang theo đồ đạc ngày càng nhiều. Đồ đạc đó là gì, mình đi sang slide sau.

**Chuyển:** "Đồ đạc của đoàn là gì?"

### Slide 4 - AI phải nhớ những gì nó đã viết

**Trên slide:** "Mỗi mẩu chữ AI viết ra là thêm một món đồ vào phòng của đoàn."

**Hình:**

```text
Câu hỏi  →  ghi chú tạm  →  viết mẩu chữ kế tiếp
                ↑_____________________|
```

Bên phải: một phòng 16 ô, mỗi mẩu chữ mới lấp thêm một ô; đầy thì cần phòng thứ hai. Chữ nhỏ cuối slide: "Tên kỹ thuật của ghi chú tạm: KV cache".

**Lời nói:** AI không viết cả câu một lần. Nó viết từng mẩu chữ, mỗi mẩu gọi là một token - có thể là một từ, nửa từ hay một dấu câu. Để viết mẩu kế tiếp cho đúng, nó phải nhớ câu hỏi của bạn và mọi thứ nó đã viết. Thay vì đọc lại từ đầu mỗi lần, nó ghi chú tạm. Trong khách sạn của ta, đó là đồ đạc của đoàn: mỗi mẩu chữ mới là một món đồ mới, và một phòng chứa được 16 món. Trả lời ngắn thì ít đồ, một phòng là đủ. Trả lời dài thì đồ chất đầy, cần nhiều phòng. Và đây là chỗ khó nhất: lúc đoàn đặt phòng, không ai biết đoàn sẽ đông đến đâu, vì chính AI cũng chưa biết câu trả lời của nó dài bao nhiêu.

**Chuyển:** "Không biết trước thì người ta đặt phòng thế nào?"

### Slide 5 - Đặt phòng trước: giữ chỗ cho trường hợp tệ nhất

**Trên slide:** Bộ đếm "3 đoàn | 12 phòng có người | 36 phòng đặt trước nhưng trống (75%)" và dòng "97 đoàn đứng ngoài cửa". Ví dụ nổi bật: "An's Tour đặt 16 phòng - đoàn chỉ đến 4 phòng."

**Hình:** 48 phòng xếp 6 hàng x 8 cột. Ba dãy 16 phòng liền nhau (mỗi dãy hai hàng), mỗi dãy một màu đoàn; trong mỗi dãy 4 phòng tô màu (có người), 12 phòng gạch đỏ (đặt trước nhưng trống). Dãy đầu ghi nhãn "An's Tour". Trạng thái thứ hai: các đoàn trả phòng, phòng trống rải rác (20 phòng, không có dãy 16 phòng liền nhau); đoàn mới bị chặn ở cửa. Chữ nhỏ: "Ví dụ minh họa. Số thật (bài báo vLLM, SOSP 2023): hệ thống cũ chỉ 20,4-38,2% bộ nhớ chứa dữ liệu thật".

**Lời nói:** Vậy trước vLLM, các hệ thống đặt phòng thế nào? Hãy nghĩ đến An's Tour. Công ty này đặt trước 16 phòng cho đoàn, vì không chắc sẽ có bao nhiêu người đi - 16 là mức tối đa. Cuối cùng đoàn chỉ đến 4 phòng. 12 phòng còn lại vẫn bị giữ nguyên tên An's Tour, không ai khác được vào. Hệ thống AI cũ làm đúng như vậy với mỗi câu hỏi: vì không biết câu trả lời dài bao nhiêu, nó giữ chỗ cho trường hợp dài nhất. Khách sạn 48 phòng, mỗi đoàn giữ 16 phòng liền nhau, nên chỉ nhận đủ 3 đoàn. Ba đoàn dùng 12 phòng, còn 36 phòng nằm trống mà không ai được vào - 75% khách sạn bị phí. Đoàn thứ 4 bước tới, nhân viên nói "hết phòng", dù nhìn đâu cũng thấy phòng trống. Còn 97 đoàn đứng ngoài cửa. Chưa hết: khi các đoàn trả phòng, phòng trống nằm rải rác. Có thể còn 20 phòng trống nhưng không có dãy 16 phòng liền nhau, đoàn mới vẫn bị từ chối. Con số 75% là ví dụ của mình, nhưng không xa thực tế: nhóm nghiên cứu vLLM đo các hệ thống cũ và thấy chỉ khoảng 20 đến 38% bộ nhớ thật sự chứa dữ liệu.

**Chuyển:** "Nếu bạn là quản lý, bạn sẽ làm gì?"

### Slide 6 - Thay vì đặt trước cả một dãy phòng...

**Trên slide:** "Cấp đúng phòng cần, vào lúc cần." Bộ đếm "12 đoàn ở cùng lúc (thay vì 3)".

**Hình:** So sánh hai khách sạn.

```text
Kiểu cũ:        [dãy 16 phòng cho An's Tour] [dãy 16 phòng cho đoàn B] ...
                → nhiều phòng đặt trước nhưng trống

PagedAttention: [phòng][phòng][phòng][phòng][phòng] ...
                → đoàn cần đến đâu, cấp phòng đến đó, phòng ở đâu cũng được

Sổ của lễ tân:  An's Tour → phòng 3, 17, 29, 40
                Đoàn B    → phòng 5, 8, 21, 22
```

Chữ nhỏ cuối slide: "PagedAttention - mượn ý tưởng quản lý bộ nhớ theo trang của hệ điều hành. Ví dụ minh họa."

**Lời nói:** (Dừng 5 giây, hỏi khán giả.) Nếu bạn là quản lý khách sạn này, bạn sẽ làm gì? Có thể bạn sẽ nói: đừng cho đặt trước cả dãy nữa. Đoàn cần bao nhiêu phòng thì cấp bấy nhiêu, phòng nào còn trống thì cấp, không cần liền nhau. Và nhờ lễ tân giữ một cuốn sổ ghi đoàn nào đang ở những phòng nào. Chúc mừng, bạn vừa nghĩ ra PagedAttention. Cụ thể: đoàn vào chỉ nhận một phòng. Đồ nhiều lên, phòng đầy, lễ tân cấp thêm một phòng ở bất cứ đâu còn trống - An's Tour ở phòng 3, rồi 17, rồi 29, rồi 40. Đoàn xong thì trả hết phòng ngay. Chỗ phí duy nhất là vài ô trống ở phòng cuối cùng của mỗi đoàn. Với 48 phòng và mỗi đoàn dùng trung bình 4 phòng, ta có thể cho ở cùng lúc 12 đoàn thay vì 3 - gấp 4 lần với cùng một khách sạn. Đây là ví dụ để dễ hình dung; con số thật nằm trong khoảng 2 đến 4 lần, mình sẽ quay lại ở phần kết quả. Ý tưởng này vốn đã có từ lâu trong cách hệ điều hành quản lý bộ nhớ theo từng "trang", nên mới có tên PagedAttention.

**Chuyển:** "Có phòng rồi. Nhưng còn chuyện khi nào mời đoàn vào."

### Slide 7 - Có phòng rồi, nhưng đợi đoàn ở lâu nhất

**Trên slide:** "Cách cũ: chỉ nhận nhóm mới khi cả nhóm cũ đã trả phòng."

**Hình:** Biểu đồ Gantt 3 làn, mỗi cột là một vòng phục vụ. Ô có đoàn tô màu, ô đoàn đã xong nhưng chưa được thay tô xám. D và E đứng chờ ở cửa.

```text
Vòng:    1  2  3  4  5  6  7  8
Làn 1:   A  A  A  A  A  A  D  D
Làn 2:   B  B  .  .  .  .  E  E
Làn 3:   C  C  C  .  .  .  .  .
                           ↑ D, E chỉ vào được từ vòng 7
```

Chữ nhỏ: "Ví dụ minh họa: 3 đoàn ở cùng lúc. Chữ A, B, C, D, E giữ một màu cố định đến slide 8."

**Lời nói:** Có phòng rồi, nhưng còn một câu hỏi: khi nào mời đoàn vào? Mỗi vòng, nhân viên đi qua từng đoàn một lần, mang cho mỗi đoàn một mẩu chữ mới. Cách cũ là gom một nhóm, ví dụ 3 đoàn A, B, C, cho vào cùng lúc, và chỉ nhận nhóm kế khi cả ba đã trả phòng. A là đoàn lớn nhờ viết bài luận, ở 6 vòng. B chỉ chào hỏi, xong sau 2 vòng. C xong sau 3 vòng. B và C xong rồi nhưng phòng cứ để trống, chờ A. Trong lúc đó D và E đứng ngoài cửa, đến vòng thứ 7 mới được vào. Cái giá có hai mặt: phòng và nhân viên rảnh rỗi - tức GPU bị lãng phí - và đoàn mới phải chờ dù trong nhà đã có phòng trống từ lâu.

**Chuyển:** "Sửa chuyện này rất đơn giản."

### Slide 8 - Một đoàn ra, một đoàn vào

**Trên slide:** "Sau mỗi vòng: đoàn nào xong thì ra, đoàn đang chờ vào ngay."

**Hình:** Cùng Gantt của slide 7, biến đổi: D và E trượt vào các ô xám.

```text
Vòng:    1  2  3  4  5  6
Làn 1:   A  A  A  A  A  A
Làn 2:   B  B  D  D  .  .      ← B xong, D vào ngay
Làn 3:   C  C  C  E  E  .      ← C xong, E vào ngay
```

Hai chip bên cạnh: "Xong sau 6 vòng (thay vì 8)" và "D vào từ vòng 3 (thay vì vòng 7)". Chữ nhỏ: "Ví dụ minh họa. Tên kỹ thuật: continuous batching; ý tưởng từ nghiên cứu Orca (OSDI 2022)".

**Lời nói:** Continuous batching sửa đúng chỗ đó. Sau mỗi vòng, quản lý nhìn quanh: đoàn nào xong thì trả phòng, đoàn đang chờ ở cửa được mời vào ngay chỗ đó. Vòng 1 có A, B, C. B xong sau vòng 2 thì D vào ở vòng 3. C xong sau vòng 3 thì E vào ở vòng 4. A vẫn ở đó, và không ai phải chờ A nữa. Kết quả: cả năm đoàn xong trong 6 vòng thay vì 8, và D bắt đầu từ vòng 3 thay vì vòng 7. Ý tưởng này được công bố lần đầu năm 2022 trong một nghiên cứu tên Orca, và vLLM áp dụng nó.

**Chuyển:** "Hai ý tưởng này không chỉ cộng vào nhau - chúng cần nhau."

### Slide 9 - Hai ý tưởng, một khách sạn đầy khách

**Trên slide:**

```text
PagedAttention            Continuous batching
Dùng phòng không bị phí   Phòng lúc nào cũng có người
        \                  /
         → Phục vụ nhiều yêu cầu hơn
```

**Hình:** Hai bánh răng ăn khớp. Bên dưới, hai khách sạn cạnh nhau với 100 đoàn ở cửa: kiểu cũ "3 vào, 97 chờ", kiểu mới "12 vào, 88 chờ, hàng chờ đi nhanh". Chữ nhỏ: "Ví dụ minh họa".

**Lời nói:** Hai mẹo này giúp nhau chứ không chỉ cộng vào nhau. Xếp phòng thông minh cho phép khách sạn đón cùng lúc 12 đoàn thay vì 3. Mời đoàn vào liên tục bảo đảm 12 chỗ đó lúc nào cũng có người ở, không chỗ nào nằm chờ. Và vì phòng được trả ngay khi đoàn xong, quản lý luôn có chỗ để mời đoàn kế tiếp. Thiếu một trong hai là hỏng: có phòng mà không mời kịp thì phí, mời kịp mà không đủ phòng thì kẹt. Quay lại 100 đoàn ở cửa: kiểu cũ nhận 3 đoàn, 97 đoàn chờ; kiểu mới nhận 12 đoàn, 88 đoàn chờ, và hàng chờ đi nhanh hơn vì cứ có đoàn xong là có đoàn vào. Cùng một khách sạn, cùng 48 phòng.

**Chuyển:** "Thực tế đo được thế nào? Phần này mình chỉ nói những số đã có nguồn."

### Slide 10 - Kết quả: hướng cải thiện và số liệu có nguồn

Trạng thái: bản nháp, chưa chốt số liệu.

**Trên slide (hướng cải thiện, chưa kèm số):**

- Xử lý được nhiều yêu cầu hơn cùng lúc.
- Ít lãng phí bộ nhớ.
- GPU bận hơn.
- Người dùng nhận phản hồi nhanh hơn.

**Hình:** Bốn thẻ hướng cải thiện, bên dưới một bảng nhỏ "Số liệu từ bài báo gốc" có cột "Điều kiện đo". Không vẽ biểu đồ so sánh nhiều công cụ.

**Lời nói (bản nháp):** Cả hai ý tưởng cùng hướng đến bốn điều: phục vụ được nhiều yêu cầu hơn, ít lãng phí bộ nhớ hơn, GPU bận hơn, và người dùng nhận phản hồi nhanh hơn. Các nhà nghiên cứu vLLM đo được mức phí bộ nhớ dưới 4%, và lượng yêu cầu phục vụ được cao hơn khoảng 2 đến 4 lần so với các hệ thống tiên tiến cùng thời. Xin lưu ý: đó là điều kiện thí nghiệm của họ, với mô hình cỡ 13 tỷ tham số trên GPU A100 40 GB, năm 2023. Máy của bạn, mô hình của bạn sẽ cho con số khác. Muốn biết chắc, hãy đo bằng đúng mô hình, GPU và lượng người dùng của bạn.

**Cần làm trước khi chốt (không đưa lên slide khi chưa xong):**

| Hạng mục | Tình trạng | Điều kiện để đưa lên slide |
|---|---|---|
| Phí bộ nhớ dưới 4%; thông lượng gấp 2-4 lần; dùng chung tiết kiệm tới 55% | Đã có nguồn (xem mục 4) | Ghi rõ nguồn, mô hình, GPU, năm đo ngay trên slide; đọc lại nguồn lần cuối trước khi chốt |
| Phần trăm cải thiện cụ thể của mình | Chưa có | Tự đo: cùng mô hình, cùng GPU, cùng bộ yêu cầu (độ dài vào/ra), cùng số người dùng đồng thời, chạy tối thiểu 3 lần, ghi tên và phiên bản công cụ đối chiếu |
| Biểu đồ so sánh | Chưa có | Chỉ vẽ từ số tự đo; trục và điều kiện ghi rõ |
| Câu "vLLM nhanh gấp X lần" | Cấm | Chỉ dùng khi có kèm công cụ đối chiếu, mô hình, GPU, tải |

Các chỉ số nên đo: số yêu cầu mỗi giây, số token mỗi giây, thời gian chờ chữ đầu tiên, độ trễ p50 và p95, bộ nhớ GPU đã dùng.

**Chuyển:** "Vậy khi nào bạn nên dùng nó?"

### Slide 11 - Khi nào nên (và không cần) dùng vLLM

Trạng thái: nội dung ổn, chờ duyệt.

**Trên slide:**

Nên dùng khi:

- Xây API cho LLM phục vụ nhiều người.
- Chạy chatbot hoặc ứng dụng AI trên máy chủ.
- Có GPU và muốn xử lý nhiều yêu cầu cùng lúc.
- Muốn mở rộng khi số người dùng tăng.

Có thể chưa cần khi:

- Chỉ thử một câu lệnh cho cá nhân.
- Làm bản demo rất nhỏ.
- Chủ yếu chạy trên laptop hoặc CPU.
- Ưu tiên số một là cài đặt cực kỳ đơn giản.

**Hình:** Hai cột thẻ (xanh và vàng). Một thanh chip ứng dụng: Chatbot nội bộ, Hỏi đáp tài liệu, Trợ lý lập trình, Dịch vụ AI dùng chung.

**Lời nói:** Quay lại khách sạn. Quản lý giỏi chỉ đáng giá khi có đông đoàn khách. Nếu công ty bạn muốn tự chạy AI trên máy của mình - ví dụ vì dữ liệu nhạy cảm không muốn gửi ra ngoài - và có nhiều người dùng cùng lúc, như chatbot nội bộ, hỏi đáp trên tài liệu công ty, trợ lý lập trình hay một dịch vụ AI dùng chung, thì vLLM rất hợp. Nhưng nếu chỉ có một đoàn nhỏ - tức bạn dùng một mình, thử một câu lệnh, làm một bản demo nhỏ, chạy trên laptop hay chỉ có CPU, hoặc bạn cần cách cài đơn giản nhất - thì không cần thuê quản lý. Những công cụ nhẹ hơn là đủ.

**Chuyển:** "Vậy nên chọn công cụ nào cho tình huống nào?"

### Slide 12 - Công cụ nào hợp tình huống nào?

Trạng thái: khung bản nháp. Mọi nhận định trong bảng là giả thuyết cần kiểm chứng bằng tài liệu chính thức của từng công cụ trước khi lên slide.

**Trên slide:** Câu hỏi lớn "Công cụ nào hợp với tình huống nào?" - không có công cụ "tốt nhất".

**Hình:** Lưới tình huống x công cụ bằng chip tên công cụ, không có điểm số, không có thanh xếp hạng, không có cột "thắng".

| Tình huống | Công cụ thường được nhắc tới | Giả thuyết cần kiểm chứng |
|---|---|---|
| Chạy thử một mình trên laptop hoặc CPU, cài đặt đơn giản | Ollama | Dễ cài, hợp dùng cá nhân; chưa rõ phục vụ nhiều người cùng lúc tốt đến đâu |
| Nghiên cứu, thử nghiệm mô hình, tùy biến sâu | Hugging Face Transformers | Linh hoạt; không phải công cụ tối ưu để phục vụ nhiều người |
| Phục vụ nhiều người trên GPU, có API tương thích OpenAI | vLLM, TGI, SGLang | Cả ba là engine phục vụ; khác nhau ở tính năng, mô hình hỗ trợ và độ trưởng thành; phải kiểm tra tình trạng phát triển hiện tại của TGI và so sánh theo tải thật |
| Tối đa hiệu năng trên GPU NVIDIA, chấp nhận cấu hình phức tạp hơn | TensorRT-LLM | Chỉ chạy trên NVIDIA, tối ưu sâu, cài đặt phức tạp hơn |

**Lời nói (bản nháp):** Không có công cụ nào tốt nhất cho mọi tình huống, nên mình đổi câu hỏi: công cụ nào hợp với việc của bạn? Chạy thử một mình thì có những công cụ đơn giản như Ollama. Nghiên cứu và thử nghiệm thì có thư viện Transformers. Phục vụ nhiều người trên GPU thì có vLLM và vài engine khác như TGI hay SGLang. Còn muốn vắt kiệt hiệu năng trên GPU NVIDIA thì có TensorRT-LLM, đổi lại là cấu hình phức tạp hơn. Mình không xếp hạng ở đây, vì kết quả phụ thuộc vào mô hình, GPU và cách bạn dùng. Cách chắc nhất là thử với đúng tải của bạn.

**Chuyển:** "Tóm lại ba điều."

### Slide 13 - Ba điều mang về

**Trên slide:**

1. vLLM không làm mô hình thông minh hơn.
2. PagedAttention: xếp chỗ nhớ gọn hơn - cần đến đâu, cấp đến đó.
3. Continuous batching: xử lý linh hoạt nhiều người dùng cùng lúc - đoàn nào xong thì đoàn kế vào ngay.

**Hình:** Khách sạn 48 phòng ở góc, ba thẻ lật lần lượt.

**Lời nói:** Tóm lại ba điều. Một: vLLM không làm AI thông minh hơn - cùng một mô hình, cùng câu trả lời. Hai: PagedAttention xếp chỗ nhớ gọn hơn, cần đến đâu cấp đến đó, nên cùng 48 phòng đón được nhiều đoàn hơn - không còn cảnh đặt 16 phòng mà chỉ dùng 4. Ba: continuous batching xử lý linh hoạt nhiều người cùng lúc, đoàn nào xong thì đoàn kế vào ngay, nên không phòng nào, không nhân viên nào phải ngồi chờ. Lần tới khi thấy chữ hiện ra từng mẩu trên màn hình chatbot, hy vọng bạn sẽ nghĩ đến một khách sạn có người quản lý luôn biết cách xếp phòng.

**Chuyển:** "Mình sẵn sàng nhận câu hỏi."

### Slide 14 - Cảm ơn và hỏi đáp

**Trên slide:** "Cảm ơn mọi người. Hỏi đáp." và logo vLLM.

**Lời nói:** Cảm ơn mọi người đã lắng nghe. Mình sẵn sàng nhận câu hỏi.

## 4. Số liệu đã có nguồn (dùng cho slide 5, 6 và 10)

Nguồn: bảng kiểm chứng ngày 2026-11-14 trong `content/vllm/restaurant.md` mục 7. Đọc lại nguồn lần cuối trước khi chốt slide 10.

| Số liệu | Dùng ở | Nguồn |
|---|---|---|
| Hệ thống cũ chỉ 20,4-38,2% bộ nhớ chứa dữ liệu thật (tức phí khoảng 60-80%) | Slide 5 | [Blog vLLM 2023](https://vllm.ai/blog/2023-06-20-vllm#:~:text=existing%20systems%20waste) |
| vLLM phí dưới 4% | Slide 10 | [Blog vLLM 2023](https://vllm.ai/blog/2023-06-20-vllm#:~:text=with%20a%20mere%20waste%20of%20under%204%25) |
| Thông lượng cao hơn 2-4 lần so với FasterTransformer và Orca | Slide 6, 10 | [arXiv abstract](https://arxiv.org/abs/2309.06180#:~:text=improves%20the%20throughput%20of%20popular%20LLMs%20by%202%2D4) |
| Dùng chung giảm tới 55% bộ nhớ | Slide 10 (tùy chọn) | [Blog vLLM 2023](https://vllm.ai/blog/2023-06-20-vllm#:~:text=cutting%20their%20memory%20usage%20by%20up%20to%2055%25) |
| Mô hình 13B trên A100 40 GB; block mặc định 16 token | Slide 4, 10 | [Kwon et al., SOSP 2023 (PDF)](https://arxiv.org/pdf/2309.06180) - PDF không nhận text fragment; câu gốc: "vLLM sets its default block size as 16." |
| Orca đề xuất iteration-level scheduling, OSDI 2022 | Slide 8 | [USENIX OSDI '22](https://www.usenix.org/conference/osdi22/presentation/yu#:~:text=we%20propose%20iteration%2Dlevel%20scheduling) |
| vLLM ra đời ở UC Berkeley | Slide 2 | [Blog vLLM 2023](https://vllm.ai/blog/2023-06-20-vllm#:~:text=vLLM%20has%20been%20developed%20at%20UC%20Berkeley) |

Chưa dùng trên slide: "gấp tới 24 lần HuggingFace", "gấp 8 lần / 23 lần" của Anyscale. Mỗi số có công cụ đối chiếu và điều kiện riêng; chỉ đưa lên nếu slide ghi đủ điều kiện.

## 5. Câu hỏi dự phòng cho phần hỏi đáp

| Câu hỏi | Trả lời ngắn |
|---|---|
| Vì sao nhiều đoàn ở cùng lúc lại cho nhiều câu trả lời hơn mỗi giây? | Mỗi vòng, nhân viên phải ra kho lấy đồ nghề (nạp mô hình) một lần, dù phục vụ 3 hay 12 đoàn. Phục vụ 12 đoàn trong một vòng thì lợi hơn nhiều so với 3. |
| vLLM có làm câu trả lời kém đi không? | Không. Nó không đổi mô hình, chỉ đổi cách xếp chỗ và cách xếp lịch phục vụ. |
| Nếu 48 phòng đều đã kín thì sao? | Quản lý tạm đưa một số đoàn ra ngoài chờ (hoặc cất đồ đi để dùng lại sau) rồi mời vào lại khi có phòng. Cần kiểm lại tên gọi kỹ thuật chính xác trong tài liệu vLLM trước khi nói. |
| Các câu trả lời cho cùng một câu hỏi có dùng chung đồ đạc không? | Có: nhiều phiên bản trả lời cùng một câu hỏi dùng chung phần đầu của đồ đạc (chính là câu hỏi), chỉ tách ra khi bắt đầu viết khác nhau. Tiết kiệm tới 55% bộ nhớ trong một số trường hợp (xem mục 4). |
| Con số 75% và 4 lần ở trên là số thật? | Không, đó là ví dụ minh họa với khách sạn 48 phòng. Số thật nằm ở mục 4 và có điều kiện đo riêng. |

## 6. Quyết định thiết kế

| Quyết định | Lý do | Phương án đã loại |
|---|---|---|
| Dùng khách sạn 48 phòng thay vì nhà hàng | Theo yêu cầu; "phòng" khớp trực tiếp với block (một phòng = 16 token), "dãy phòng liền nhau" khớp với cấp phát liền khối, và đoàn "ở" nhiều vòng khớp với một yêu cầu kéo dài nhiều bước | Giữ ẩn dụ nhà hàng của `content/vllm/restaurant.md`: vẫn dùng được, nhưng bản này viết riêng cho khách sạn để tránh trộn hai ẩn dụ trong một bài |
| Mỗi request là một đoàn du lịch đặt phòng trước; ví dụ chính: An's Tour đặt 16 phòng, đoàn chỉ đến 4 phòng | Đặt trước theo mức tối đa là tình huống đời thường, khán giả thấy ngay vì sao nó gây phí; khớp với việc hệ thống cũ giữ chỗ theo độ dài tối đa vì không biết trước độ dài câu trả lời | Bản đầu: khách lẻ giữ dãy 8 phòng, dùng 2 phòng - cùng tỷ lệ nhưng khó hình dung hơn vì không có tình huống đặt trước quen thuộc |
| 48 phòng, dãy 16 phòng, trung bình 4 phòng mỗi đoàn | 48 chia hết cho 16 và cho 4 nên phép tính 3 đoàn rồi 12 đoàn tròn số; 75% phí nằm trong khoảng 60-80% bài báo nêu; hệ số 4 nằm trong khoảng 2-4 lần của bài báo | Số lẻ hoặc số lớn (ví dụ 128 phòng): khó đếm bằng mắt trên slide |
| Vấn đề thứ hai (chờ đoàn ở lâu nhất, slide 7) đặt ngay trước lời giải (slide 8) thay vì gom hết vấn đề ở phần 2 | Khán giả nhận lời giải khi cái đau còn mới; gom hết vấn đề trước rồi mới giải dễ làm họ quên vấn đề đầu | Gom cả hai vấn đề vào phần 2 như cấu trúc 5 phần gốc: giữ nguyên 5 phần nhưng slide 7 thuộc về phần 3 |
| Từ "KV cache" chỉ xuất hiện chữ nhỏ ở slide 4 | Khán giả không chuyên; thuật ngữ làm họ mất mạch, trong khi ý "đồ đạc của đoàn" đã đủ | Đưa KV cache lên tiêu đề |
| Timeline continuous batching dùng 5 đoàn A-E với số vòng cố định | Đếm được bằng mắt; kiểu cũ 8 vòng và kiểu mới 6 vòng tính lại được; giữ màu và chữ A-E từ slide 7 sang slide 8 | Timeline gốc (A, B rồi C vào vòng 2, D vào vòng 4): không cho thấy khoảng chờ ngoài cửa và phòng trống bị phí |
| Slide 12 không dùng ẩn dụ khách sạn và không xếp hạng | Mỗi công cụ không ánh xạ sạch vào khách sạn; xếp hạng dễ thành "vLLM luôn tốt nhất" | Biểu đồ cột hoặc bảng điểm |
| Slide 10 chỉ nêu số có nguồn kèm điều kiện đo, và liệt kê rõ phần chờ đo | Số của bài báo (13B, A100 40 GB, 2023) không đại diện cho máy của người nghe | Ghi "vLLM nhanh gấp X lần" không kèm điều kiện |
