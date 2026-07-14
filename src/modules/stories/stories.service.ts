import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, LessThan } from 'typeorm';
import { Story } from './entities/story.entity';
import { Reader } from './entities/reader.entity';
import { ReaderOtp } from './entities/reader-otp.entity';
import { Genre } from './entities/genre.entity';
import { Visit } from './entities/visit.entity';
import { Chapter } from './entities/chapter.entity';
import { CreateStoryDto } from './dtos/create-story.dto';
import { UpdateStoryDto } from './dtos/update-story.dto';
import { CreateGenreDto } from './dtos/create-genre.dto';
import { UpdateGenreDto } from './dtos/update-genre.dto';
import { CreateChapterDto, UpdateChapterDto } from './dtos/chapter.dto';
import { BaseResponse } from 'src/common/responses/base-response';
import { MailService } from 'src/services/mail.service';
import { Notification } from './entities/notification.entity';
import { NotificationsGateway } from '../notification/notifications.gateway';

@Injectable()
export class StoriesService {
  constructor(
    @InjectRepository(Story)
    private readonly storyRepo: Repository<Story>,
    @InjectRepository(Reader)
    private readonly readerRepo: Repository<Reader>,
    @InjectRepository(ReaderOtp)
    private readonly readerOtpRepo: Repository<ReaderOtp>,
    @InjectRepository(Genre)
    private readonly genreRepo: Repository<Genre>,
    @InjectRepository(Visit)
    private readonly visitRepo: Repository<Visit>,
    @InjectRepository(Chapter)
    private readonly chapterRepo: Repository<Chapter>,
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    private readonly mailService: MailService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  // ─── Public ────────────────────────────────────────────────────────────────

  async findAll(query?: {
    page?: number;
    limit?: number;
    genreId?: number;
    search?: string;
  }) {
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 10;
    const skip = (page - 1) * limit;
    const genreId = query?.genreId;
    const search = query?.search;

    const where: any = { isApproved: true };
    if (genreId) {
      where.genre = { id: genreId };
    }
    if (search) {
      where.title = ILike(`%${search}%`);
    }

    const [stories, total] = await this.storyRepo.findAndCount({
      where,
      relations: ['genre'],
      select: {
        id: true,
        title: true,
        author: true,
        description: true,
        coverImage: true,
        isShortStory: true,
        views: true,
        createdAt: true,
        genre: {
          id: true,
          name: true,
        },
      },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return new BaseResponse(200, 'Lấy danh sách truyện thành công', {
      stories,
      total,
      page,
      limit,
    });
  }

  async findOne(id: number) {
    const story = await this.storyRepo.findOne({
      where: { id },
      relations: ['genre'],
    });
    if (!story || !story.isApproved)
      throw new NotFoundException('Không tìm thấy truyện');

    // Tăng lượng xem đối với truyện ngắn
    if (story.isShortStory) {
      story.views = (story.views || 0) + 1;
      await this.storyRepo.save(story);
    }

    return new BaseResponse(200, 'Lấy chi tiết truyện thành công', story);
  }

  // ─── Reader Auth ─────────────────────────────────────────────────────────────

  async sendOtp(email: string) {
    // Kiểm tra email đã đăng ký chưa
    const existing = await this.readerRepo.findOne({ where: { email } });
    if (existing) {
      throw new BadRequestException(
        'Email này đã được đăng ký. Vui lòng đăng nhập.',
      );
    }

    // Xóa OTP cũ của email này
    await this.readerOtpRepo.delete({ email });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

    await this.readerOtpRepo.save(
      this.readerOtpRepo.create({ email, otp, expiresAt }),
    );

    await this.mailService.sendOtpEmail(email, otp);

    return new BaseResponse(200, 'Mã OTP đã được gửi đến email của bạn', null);
  }

  async registerReader(username: string, email: string, otp: string) {
    // Kiểm tra email đã tồn tại chưa
    const existing = await this.readerRepo.findOne({ where: { email } });
    if (existing) {
      throw new BadRequestException(
        'Email này đã được đăng ký. Vui lòng đăng nhập.',
      );
    }

    // Xóa OTP hết hạn
    await this.readerOtpRepo.delete({ expiresAt: LessThan(new Date()) });

    const otpRecord = await this.readerOtpRepo.findOne({
      where: { email, otp },
    });
    if (!otpRecord) {
      throw new BadRequestException('Mã OTP không hợp lệ hoặc đã hết hạn.');
    }
    if (otpRecord.expiresAt < new Date()) {
      await this.readerOtpRepo.delete({ id: otpRecord.id });
      throw new BadRequestException('Mã OTP đã hết hạn. Vui lòng gửi lại.');
    }

    const reader = await this.readerRepo.save(
      this.readerRepo.create({ username, email, isVerified: true }),
    );

    await this.readerOtpRepo.delete({ id: otpRecord.id });

    return new BaseResponse(201, 'Đăng ký thành công', {
      id: reader.id,
      username: reader.username,
      email: reader.email,
      createdAt: reader.createdAt,
    });
  }

  async loginByEmail(email: string) {
    const reader = await this.readerRepo.findOne({ where: { email } });
    if (!reader) {
      throw new NotFoundException(
        'Email chưa được đăng ký. Vui lòng đăng ký tài khoản.',
      );
    }
    return new BaseResponse(200, 'Đăng nhập thành công', {
      id: reader.id,
      username: reader.username,
      email: reader.email,
      createdAt: reader.createdAt,
    });
  }

  async getReaderById(id: number) {
    const reader = await this.readerRepo.findOne({ where: { id } });
    if (!reader) throw new NotFoundException('Không tìm thấy độc giả');
    return new BaseResponse(200, 'Lấy thông tin độc giả thành công', {
      id: reader.id,
      username: reader.username,
      email: reader.email,
      createdAt: reader.createdAt,
    });
  }

  async updateReader(id: number, username: string, email: string) {
    const reader = await this.readerRepo.findOne({ where: { id } });
    if (!reader) throw new NotFoundException('Không tìm thấy độc giả');

    if (email !== reader.email) {
      const emailDup = await this.readerRepo.findOne({ where: { email } });
      if (emailDup) {
        throw new BadRequestException(
          'Email này đã được sử dụng bởi tài khoản khác.',
        );
      }
    }

    reader.username = username;
    reader.email = email;
    await this.readerRepo.save(reader);

    return new BaseResponse(200, 'Cập nhật thông tin độc giả thành công', {
      id: reader.id,
      username: reader.username,
      email: reader.email,
      createdAt: reader.createdAt,
    });
  }

  async getReaderStats(readerId: number) {
    const reader = await this.readerRepo.findOne({ where: { id: readerId } });
    if (!reader) throw new NotFoundException('Không tìm thấy độc giả');

    const totalRegistered = await this.storyRepo.count({
      where: { author: reader.username, isReaderStory: true },
    });
    const totalApproved = await this.storyRepo.count({
      where: { author: reader.username, isReaderStory: true, isApproved: true },
    });
    const totalRejected = await this.storyRepo.count({
      where: { author: reader.username, isReaderStory: true, isRejected: true },
    });

    return new BaseResponse(200, 'Thống kê độc giả thành công', {
      reader: {
        id: reader.id,
        username: reader.username,
        email: reader.email,
        createdAt: reader.createdAt,
      },
      totalRegistered,
      totalApproved,
      totalRejected,
    });
  }

  async findAllReaders(query?: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 20;
    const skip = (page - 1) * limit;
    const search = query?.search;

    const where: any = {};
    if (search) {
      where.username = ILike(`%${search}%`);
    }

    const [readers, total] = await this.readerRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    // Đếm số truyện đăng ký cho từng reader
    const readersWithCount = await Promise.all(
      readers.map(async (reader) => {
        const totalRegistered = await this.storyRepo.count({
          where: { author: reader.username, isReaderStory: true },
        });
        return {
          id: reader.id,
          username: reader.username,
          email: reader.email,
          createdAt: reader.createdAt,
          totalRegistered,
        };
      }),
    );

    return new BaseResponse(200, 'Lấy danh sách độc giả thành công', {
      readers: readersWithCount,
      total,
      page,
      limit,
    });
  }

  async logVisit(ip?: string) {
    try {
      const visit = this.visitRepo.create({ ip });
      await this.visitRepo.save(visit);
    } catch {
      // Ignore errors logging visits
    }
  }

  // ─── Notifications ─────────────────────────────────────────────────────────

  async createNotification(
    readerId: number | null,
    title: string,
    content: string,
  ) {
    const notification = this.notificationRepo.create({
      readerId,
      title,
      content,
      isRead: false,
    });
    const saved = await this.notificationRepo.save(notification);

    if (readerId) {
      this.notificationsGateway.sendToReader(readerId, {
        id: saved.id,
        title: saved.title,
        content: saved.content,
        isRead: saved.isRead,
        createdAt: saved.createdAt,
      });
    } else {
      this.notificationsGateway.broadcast({
        id: saved.id,
        title: saved.title,
        content: saved.content,
        isRead: saved.isRead,
        createdAt: saved.createdAt,
      });
    }

    return saved;
  }

  async getReaderNotifications(readerId: number) {
    const notifications = await this.notificationRepo.find({
      where: [{ readerId: readerId }, { readerId: null }],
      order: { createdAt: 'DESC' },
    });
    return new BaseResponse(
      200,
      'Lấy danh sách thông báo thành công',
      notifications,
    );
  }

  async markNotificationAsRead(id: number, readerId: number) {
    const notification = await this.notificationRepo.findOne({
      where: [
        { id, readerId: readerId },
        { id, readerId: null },
      ],
    });
    if (!notification) throw new NotFoundException('Không tìm thấy thông báo');

    notification.isRead = true;
    await this.notificationRepo.save(notification);

    return new BaseResponse(200, 'Đánh dấu đã đọc thành công', notification);
  }

  async sendCustomNotification(
    readerId: number | null,
    title: string,
    content: string,
  ) {
    if (readerId) {
      const reader = await this.readerRepo.findOne({ where: { id: readerId } });
      if (!reader) throw new NotFoundException('Không tìm thấy độc giả');
    }
    const notification = await this.createNotification(
      readerId,
      title,
      content,
    );
    return new BaseResponse(201, 'Gửi thông báo thành công', notification);
  }

  // ─── Genres ─────────────────────────────────────────────────────────────────

  async findAllGenres(query?: { hasStories?: boolean }) {
    if (query?.hasStories) {
      const genres = await this.genreRepo
        .createQueryBuilder('genre')
        .innerJoin('genre.stories', 'story')
        .where('story.isApproved = :isApproved', { isApproved: true })
        .orderBy('genre.name', 'ASC')
        .getMany();
      return new BaseResponse(
        200,
        'Lấy danh sách thể loại có truyện thành công',
        genres,
      );
    }

    const genres = await this.genreRepo.find({ order: { name: 'ASC' } });
    return new BaseResponse(200, 'Lấy danh sách thể loại thành công', genres);
  }

  async findOneGenre(id: number) {
    const genre = await this.genreRepo.findOne({ where: { id } });
    if (!genre) throw new NotFoundException('Không tìm thấy thể loại');
    return new BaseResponse(200, 'Lấy chi tiết thể loại thành công', genre);
  }

  async createGenre(dto: CreateGenreDto) {
    const genre = this.genreRepo.create(dto);
    const saved = await this.genreRepo.save(genre);
    return new BaseResponse(201, 'Tạo thể loại thành công', saved);
  }

  async updateGenre(id: number, dto: UpdateGenreDto) {
    const genre = await this.genreRepo.findOne({ where: { id } });
    if (!genre) throw new NotFoundException('Không tìm thấy thể loại');
    Object.assign(genre, dto);
    const saved = await this.genreRepo.save(genre);
    return new BaseResponse(200, 'Cập nhật thể loại thành công', saved);
  }

  async removeGenre(id: number) {
    const genre = await this.genreRepo.findOne({ where: { id } });
    if (!genre) throw new NotFoundException('Không tìm thấy thể loại');
    await this.genreRepo.remove(genre);
    return new BaseResponse(200, 'Xóa thể loại thành công', null);
  }

  // ─── Admin ──────────────────────────────────────────────────────────────────

  async create(dto: CreateStoryDto) {
    dto = normalizeStoryDto(dto);
    const trimmedTitle = dto.title?.trim();
    const existing = await this.storyRepo
      .createQueryBuilder('story')
      .where('LOWER(story.title) = LOWER(:title)', { title: trimmedTitle })
      .getOne();
    if (existing) {
      throw new BadRequestException('Truyện với tiêu đề này đã tồn tại');
    }

    const { genreId, ...storyData } = dto;
    const story = this.storyRepo.create({
      ...storyData,
      title: trimmedTitle,
      isApproved: false,
      isRejected: false,
    });
    if (genreId) {
      const genre = await this.genreRepo.findOne({ where: { id: genreId } });
      if (genre) story.genre = genre;
    }
    const saved = await this.storyRepo.save(story);
    return new BaseResponse(201, 'Tạo truyện thành công', saved);
  }

  async update(id: number, dto: UpdateStoryDto) {
    dto = normalizeStoryDto(dto);
    const story = await this.storyRepo.findOne({ where: { id } });
    if (!story) throw new NotFoundException('Không tìm thấy truyện');
    const { genreId, ...storyData } = dto;
    Object.assign(story, storyData);
    if (genreId !== undefined) {
      if (genreId === null) {
        story.genre = null;
      } else {
        const genre = await this.genreRepo.findOne({ where: { id: genreId } });
        if (genre) story.genre = genre;
      }
    }
    const saved = await this.storyRepo.save(story);
    return new BaseResponse(200, 'Cập nhật truyện thành công', saved);
  }

  async remove(id: number) {
    const story = await this.storyRepo.findOne({ where: { id } });
    if (!story) throw new NotFoundException('Không tìm thấy truyện');
    await this.storyRepo.remove(story);
    return new BaseResponse(200, 'Xóa truyện thành công', null);
  }

  async getStats(filter?: { date?: string; month?: string; year?: string }) {
    const totalStories = await this.storyRepo.count();
    const totalReaders = await this.readerRepo.count();
    const totalViews = await this.visitRepo.count();

    let targetDateStr = filter?.date;
    const targetMonthStr = filter?.month;
    const targetYearStr = filter?.year;

    // Default to today if nothing is provided
    const today = new Date();
    const yyyy = today.getFullYear().toString();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');

    if (!targetDateStr && !targetMonthStr && !targetYearStr) {
      targetDateStr = `${yyyy}-${mm}-${dd}`;
    }

    let trafficData: { label: string; visits: number }[] = [];
    let hourlyData: { label: string; visits: number }[] = [];

    if (targetDateStr) {
      const startDate = new Date(targetDateStr);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(targetDateStr);
      endDate.setHours(23, 59, 59, 999);

      const visits = await this.visitRepo
        .createQueryBuilder('visit')
        .where(
          'visit.created_at >= :startDate AND visit.created_at <= :endDate',
          { startDate, endDate },
        )
        .getMany();

      const hoursMap = new Map<number, number>();
      for (let h = 0; h < 24; h++) hoursMap.set(h, 0);
      visits.forEach((v) => {
        const hour = new Date(v.createdAt).getHours();
        hoursMap.set(hour, (hoursMap.get(hour) || 0) + 1);
      });

      hourlyData = Array.from(hoursMap.entries()).map(([hour, count]) => ({
        label: `${String(hour).padStart(2, '0')}h`,
        visits: count,
      }));

      const weekStartDate = new Date(startDate);
      weekStartDate.setDate(startDate.getDate() - 6);

      const weeklyVisits = await this.visitRepo
        .createQueryBuilder('visit')
        .where(
          'visit.created_at >= :weekStartDate AND visit.created_at <= :endDate',
          { weekStartDate, endDate },
        )
        .getMany();

      const daysOfWeek = [
        'Chủ Nhật',
        'Thứ 2',
        'Thứ 3',
        'Thứ 4',
        'Thứ 5',
        'Thứ 6',
        'Thứ 7',
      ];
      const dailyMap = new Map<string, number>();
      for (let i = 0; i < 7; i++) {
        const d = new Date(weekStartDate);
        d.setDate(weekStartDate.getDate() + i);
        const dayLabel = daysOfWeek[d.getDay()];
        dailyMap.set(dayLabel, 0);
      }

      weeklyVisits.forEach((v) => {
        const dayLabel = daysOfWeek[new Date(v.createdAt).getDay()];
        if (dailyMap.has(dayLabel)) {
          dailyMap.set(dayLabel, (dailyMap.get(dayLabel) || 0) + 1);
        }
      });

      trafficData = Array.from(dailyMap.entries()).map(([label, count]) => ({
        label,
        visits: count,
      }));
    } else if (targetMonthStr && targetYearStr) {
      const year = parseInt(targetYearStr, 10);
      const month = parseInt(targetMonthStr, 10) - 1;
      const startDate = new Date(year, month, 1, 0, 0, 0, 0);
      const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

      const visits = await this.visitRepo
        .createQueryBuilder('visit')
        .where(
          'visit.created_at >= :startDate AND visit.created_at <= :endDate',
          { startDate, endDate },
        )
        .getMany();

      const daysInMonth = endDate.getDate();
      const dailyMap = new Map<string, number>();
      for (let d = 1; d <= daysInMonth; d++) {
        const dayLabel = `${String(d).padStart(2, '0')}/${targetMonthStr}`;
        dailyMap.set(dayLabel, 0);
      }

      visits.forEach((v) => {
        const d = new Date(v.createdAt).getDate();
        const dayLabel = `${String(d).padStart(2, '0')}/${targetMonthStr}`;
        if (dailyMap.has(dayLabel)) {
          dailyMap.set(dayLabel, (dailyMap.get(dayLabel) || 0) + 1);
        }
      });

      trafficData = Array.from(dailyMap.entries()).map(([label, count]) => ({
        label,
        visits: count,
      }));

      const hoursMap = new Map<number, number>();
      for (let h = 0; h < 24; h++) hoursMap.set(h, 0);
      visits.forEach((v) => {
        const hour = new Date(v.createdAt).getHours();
        hoursMap.set(hour, (hoursMap.get(hour) || 0) + 1);
      });
      hourlyData = Array.from(hoursMap.entries()).map(([hour, count]) => ({
        label: `${String(hour).padStart(2, '0')}h`,
        visits: count,
      }));
    } else if (targetYearStr) {
      const year = parseInt(targetYearStr, 10);
      const startDate = new Date(year, 0, 1, 0, 0, 0, 0);
      const endDate = new Date(year, 11, 31, 23, 59, 59, 999);

      const visits = await this.visitRepo
        .createQueryBuilder('visit')
        .where(
          'visit.created_at >= :startDate AND visit.created_at <= :endDate',
          { startDate, endDate },
        )
        .getMany();

      const monthlyMap = new Map<string, number>();
      for (let m = 1; m <= 12; m++) {
        monthlyMap.set(`Tháng ${m}`, 0);
      }

      visits.forEach((v) => {
        const m = new Date(v.createdAt).getMonth() + 1;
        const monthLabel = `Tháng ${m}`;
        if (monthlyMap.has(monthLabel)) {
          monthlyMap.set(monthLabel, (monthlyMap.get(monthLabel) || 0) + 1);
        }
      });

      trafficData = Array.from(monthlyMap.entries()).map(([label, count]) => ({
        label,
        visits: count,
      }));

      const hoursMap = new Map<number, number>();
      for (let h = 0; h < 24; h++) hoursMap.set(h, 0);
      visits.forEach((v) => {
        const hour = new Date(v.createdAt).getHours();
        hoursMap.set(hour, (hoursMap.get(hour) || 0) + 1);
      });
      hourlyData = Array.from(hoursMap.entries()).map(([hour, count]) => ({
        label: `${String(hour).padStart(2, '0')}h`,
        visits: count,
      }));
    }

    return new BaseResponse(200, 'Thống kê thành công', {
      totalStories,
      totalReaders,
      totalViews,
      trafficData,
      hourlyData,
    });
  }

  async findAllAdmin() {
    const stories = await this.storyRepo.find({
      relations: ['genre'],
      order: { createdAt: 'DESC' },
    });
    return new BaseResponse(200, 'Lấy danh sách truyện thành công', stories);
  }

  async register(dto: CreateStoryDto) {
    dto = normalizeStoryDto(dto);
    const trimmedTitle = dto.title?.trim();
    const existing = await this.storyRepo
      .createQueryBuilder('story')
      .where('LOWER(story.title) = LOWER(:title)', { title: trimmedTitle })
      .getOne();
    if (existing) {
      throw new BadRequestException('Truyện với tiêu đề này đã tồn tại');
    }

    const { genreId, ...storyData } = dto;
    const story = this.storyRepo.create({
      ...storyData,
      title: trimmedTitle,
      isApproved: false, // Pending moderation
      isRejected: false,
      isReaderStory: true,
    });
    if (genreId) {
      const genre = await this.genreRepo.findOne({ where: { id: genreId } });
      if (genre) story.genre = genre;
    }
    const saved = await this.storyRepo.save(story);
    return new BaseResponse(
      201,
      'Đăng ký truyện thành công, đang chờ kiểm duyệt',
      saved,
    );
  }

  async findPendingAdmin() {
    const stories = await this.storyRepo.find({
      where: { isApproved: false, isRejected: false },
      relations: ['genre'],
      order: { createdAt: 'DESC' },
    });
    return new BaseResponse(
      200,
      'Lấy danh sách truyện chờ duyệt thành công',
      stories,
    );
  }

  async approve(id: number) {
    const story = await this.storyRepo.findOne({ where: { id } });
    if (!story) throw new NotFoundException('Không tìm thấy truyện');
    story.isApproved = true;
    story.isRejected = false;
    await this.storyRepo.save(story);

    const reader = await this.readerRepo.findOne({
      where: { username: story.author },
    });
    if (reader) {
      await this.createNotification(
        reader.id,
        'Kịch bản được duyệt 🎉',
        `Chúc mừng! Kịch bản truyện "${story.title}" của bạn đã được Admin phê duyệt.`,
      );
    }

    return new BaseResponse(200, 'Duyệt truyện thành công', story);
  }

  async reject(id: number) {
    const story = await this.storyRepo.findOne({ where: { id } });
    if (!story) throw new NotFoundException('Không tìm thấy truyện');
    story.isApproved = false;
    story.isRejected = true;
    await this.storyRepo.save(story);

    const reader = await this.readerRepo.findOne({
      where: { username: story.author },
    });
    if (reader) {
      await this.createNotification(
        reader.id,
        'Kịch bản bị từ chối ❌',
        `Rất tiếc, kịch bản truyện "${story.title}" của bạn đã bị từ chối kiểm duyệt.`,
      );
    }

    return new BaseResponse(200, 'Từ chối truyện thành công', story);
  }

  async findReaderHistory(author: string) {
    const stories = await this.storyRepo.find({
      where: { author },
      relations: ['genre'],
      order: { createdAt: 'DESC' },
    });
    return new BaseResponse(
      200,
      'Lấy lịch sử đăng ký truyện thành công',
      stories,
    );
  }

  async updateRegisteredStory(id: number, dto: UpdateStoryDto) {
    dto = normalizeStoryDto(dto);
    const story = await this.storyRepo.findOne({ where: { id } });
    if (!story) throw new NotFoundException('Không tìm thấy truyện');

    // Constraint: Can only edit if not approved yet
    if (story.isApproved) {
      throw new BadRequestException(
        'Truyện đã được duyệt, không thể chỉnh sửa',
      );
    }

    const { genreId, ...storyData } = dto;
    Object.assign(story, storyData);
    if (genreId !== undefined) {
      if (genreId === null) {
        story.genre = null;
      } else {
        const genre = await this.genreRepo.findOne({ where: { id: genreId } });
        if (genre) story.genre = genre;
      }
    }
    const saved = await this.storyRepo.save(story);
    return new BaseResponse(200, 'Cập nhật truyện đăng ký thành công', saved);
  }

  // ─── Admin Notifications Management ─────────────────────────────────────────

  async findAllNotificationsAdmin(params: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const query = this.notificationRepo
      .createQueryBuilder('notification')
      .leftJoinAndSelect('notification.reader', 'reader')
      .orderBy('notification.createdAt', 'DESC');

    if (params.search) {
      const searchLower = `%${params.search.toLowerCase()}%`;
      query.where(
        'LOWER(notification.title) LIKE :search OR LOWER(notification.content) LIKE :search OR LOWER(reader.username) LIKE :search',
        { search: searchLower },
      );
    }

    const [items, total] = await query.skip(skip).take(limit).getManyAndCount();

    return new BaseResponse(200, 'Lấy danh sách thông báo thành công', {
      notifications: items,
      total,
    });
  }

  async removeNotificationAdmin(id: number) {
    const notification = await this.notificationRepo.findOne({ where: { id } });
    if (!notification) throw new NotFoundException('Không tìm thấy thông báo');
    await this.notificationRepo.remove(notification);
    return new BaseResponse(200, 'Xóa thông báo thành công', null);
  }

  // ─── Chapters ───────────────────────────────────────────────────────────────

  async getChaptersByStory(storyId: number) {
    const story = await this.storyRepo.findOne({ where: { id: storyId } });
    if (!story || !story.isApproved)
      throw new NotFoundException('Không tìm thấy truyện');
    const chapters = await this.chapterRepo.find({
      where: { storyId },
      order: { chapterNumber: 'ASC' },
      select: [
        'id',
        'storyId',
        'chapterNumber',
        'title',
        'synopsis',
        'views',
        'createdAt',
        'updatedAt',
      ],
    });
    return new BaseResponse(200, 'Lấy danh sách tập thành công', {
      chapters,
      total: chapters.length,
    });
  }

  async getChapter(storyId: number, chapterNumber: number) {
    const story = await this.storyRepo.findOne({ where: { id: storyId } });
    if (!story || !story.isApproved)
      throw new NotFoundException('Không tìm thấy truyện');

    const chapter = await this.chapterRepo.findOne({
      where: { storyId, chapterNumber },
    });
    if (!chapter) throw new NotFoundException('Không tìm thấy tập');
    chapter.views += 1;
    await this.chapterRepo.save(chapter);

    // Tăng lượt xem của truyện tương ứng
    await this.storyRepo
      .createQueryBuilder()
      .update(Story)
      .set({ views: () => 'views + 1' })
      .where('id = :storyId', { storyId })
      .execute();

    return new BaseResponse(200, 'Lấy chi tiết tập thành công', chapter);
  }

  async createChapter(storyId: number, dto: CreateChapterDto) {
    dto = normalizeChapterDto(dto);
    const story = await this.storyRepo.findOne({ where: { id: storyId } });
    if (!story) throw new NotFoundException('Không tìm thấy truyện');
    const existing = await this.chapterRepo.findOne({
      where: { storyId, chapterNumber: dto.chapterNumber },
    });
    if (existing)
      throw new BadRequestException(`Tập ${dto.chapterNumber} đã tồn tại`);

    story.isApproved = false;
    story.isRejected = false;
    await this.storyRepo.save(story);

    const chapter = this.chapterRepo.create({ ...dto, storyId });
    const saved = await this.chapterRepo.save(chapter);
    return new BaseResponse(201, 'Tạo tập thành công', saved);
  }

  async updateChapter(
    storyId: number,
    chapterNumber: number,
    dto: UpdateChapterDto,
  ) {
    dto = normalizeChapterDto(dto);
    const chapter = await this.chapterRepo.findOne({
      where: { storyId, chapterNumber },
    });
    if (!chapter) throw new NotFoundException('Không tìm thấy tập');
    Object.assign(chapter, dto);
    const saved = await this.chapterRepo.save(chapter);
    return new BaseResponse(200, 'Cập nhật tập thành công', saved);
  }

  async deleteChapter(storyId: number, chapterNumber: number) {
    const chapter = await this.chapterRepo.findOne({
      where: { storyId, chapterNumber },
    });
    if (!chapter) throw new NotFoundException('Không tìm thấy tập');
    await this.chapterRepo.remove(chapter);
    return new BaseResponse(200, 'Xóa tập thành công', null);
  }
}

function normalizeStoryDto(dto: any) {
  if (!dto) return dto;
  if (dto.title) dto.title = dto.title.normalize('NFC');
  if (dto.author) dto.author = dto.author.normalize('NFC');
  if (dto.description) dto.description = dto.description.normalize('NFC');
  if (dto.characters) dto.characters = dto.characters.normalize('NFC');
  if (dto.setting) dto.setting = dto.setting.normalize('NFC');
  if (dto.content) dto.content = dto.content.normalize('NFC');
  return dto;
}

function normalizeChapterDto(dto: any) {
  if (!dto) return dto;
  if (dto.title) dto.title = dto.title.normalize('NFC');
  if (dto.synopsis) dto.synopsis = dto.synopsis.normalize('NFC');
  if (dto.content) dto.content = dto.content.normalize('NFC');
  return dto;
}
