package in.hocg.web.modules.system.service.impl;

import in.hocg.web.lang.CheckError;
import in.hocg.web.modules.base.Base2Service;
import in.hocg.web.modules.system.domain.Articles;
import in.hocg.web.modules.system.domain.Channel;
import in.hocg.web.modules.system.domain.Comment;
import in.hocg.web.modules.system.domain.IFile;
import in.hocg.web.modules.system.domain.repository.ArticlesRepository;
import in.hocg.web.modules.system.filter.ArticlesFilter;
import in.hocg.web.modules.system.service.ArticlesService;
import in.hocg.web.modules.system.service.ChannelService;
import in.hocg.web.modules.system.service.CommentService;
import in.hocg.web.modules.system.service.IFileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.mongodb.datatables.mapping.DataTablesInput;
import org.springframework.data.mongodb.datatables.mapping.DataTablesOutput;
import org.springframework.stereotype.Service;
import org.springframework.util.ObjectUtils;

import java.util.Collections;
import java.util.List;
import java.util.Objects;

/**
 * Created by hocgin on 2017/12/4.
 * email: hocgin@gmail.com
 */
@Service
public class ArticlesServiceImpl
        extends Base2Service<Articles, String, ArticlesRepository> implements ArticlesService {
    
    private IFileService iFileService;
    private ChannelService channelService;
    private CommentService commentService;
    
    @Autowired
    public ArticlesServiceImpl(IFileService iFileService,
                               @Lazy ChannelService channelService,
                               @Lazy CommentService commentService) {
        this.iFileService = iFileService;
        this.channelService = channelService;
        this.commentService = commentService;
    }
    
    @Override
    public DataTablesOutput data(DataTablesInput input) {
        return repository.findAll(input);
    }
    
    @Override
    public void insert(ArticlesFilter filter, CheckError checkError) {
        Articles articles = filter.get();
        Channel channel = channelService.findOne(filter.getChannel());
        if (ObjectUtils.isEmpty(channel)) {
            checkError.putError("所选栏目不存在");
            return;
        }
        articles.setChannel(channel);
        IFile image = iFileService.findById(filter.getImage());
        if (ObjectUtils.isEmpty(image)
                || !image.exists()) {
            checkError.putError("文章图片丢失");
            return;
        }
        articles.setImage(image);
        repository.insert(articles);
    }
    
    @Override
    public List<Articles> findByChannel(String channelID) {
        return repository.findAllByChannel(channelID);
    }
    
    @Override
    public void update(ArticlesFilter filter, CheckError checkError) {
        Articles articles = repository.findOne(filter.getId());
        // 检测是否存在
        if (ObjectUtils.isEmpty(articles)) {
            checkError.putError("文章异常");
            return;
        }
        Channel channel = channelService.findOne(filter.getChannel());
        if (ObjectUtils.isEmpty(channel)) {
            checkError.putError("所选栏目不存在");
            return;
        }
        articles.setChannel(channel);
        IFile image = iFileService.findById(filter.getImage());
        if (ObjectUtils.isEmpty(image)
                || !image.exists()) {
            checkError.putError("文章图片丢失");
            return;
        }
        repository.save(filter.update(articles));
    }
    
    @Override
    public void available(String id, boolean available) {
        Articles articles = repository.findOne(id);
        if (!ObjectUtils.isEmpty(articles)) {
            articles.setAvailable(available);
            articles.updatedAt();
            repository.save(articles);
        }
    }
    
    @Override
    public void deletes(String[] id, CheckError checkError) {
        repository.deleteAllByIdIn(id);
        // 删除关联的评论
        commentService.deleteAllByOidInAndType(id, Comment.Type.Article.getCode());
    }
    
    
    @Override
    public void deletesByChannel(String... channelsId) {
        repository.deleteAllByChannelIdIn(channelsId);
    }
    
    @Override
    public void allowComments(String id, boolean allowComments) {
        Articles articles = repository.findOne(id);
        if (!ObjectUtils.isEmpty(articles)) {
            articles.setAllowComments(allowComments);
            articles.updatedAt();
            repository.save(articles);
        }
    }
    
    @Override
    public List<Articles> findByChannelAlias(String alias) {
        Channel channel = channelService.findOneByAlias(alias);
        if (Objects.nonNull(channel)) {
            return findByChannel(channel.getId());
        }
        return Collections.emptyList();
    }
}
