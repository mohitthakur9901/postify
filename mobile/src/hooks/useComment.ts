import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { useApiClient, commentApi } from '../utils/api';

export const useComments = () => {
  const [commentText, setCommentText] = useState('');
  const api = useApiClient();

  const queryClient = useQueryClient();

  const createCommentMutation = useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      const response = await commentApi.createComment(api, postId, content);
      return response.data;
    },
    onSuccess: () => {
      setCommentText('');
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: () => {
      Alert.alert('Error', 'Failed to post comment. Try again.');
    },
  });

  const LikeMutation = useMutation({
    mutationFn: (commentId: string) => commentApi.likeComment(api, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
    onError: () => {
      Alert.alert('Error', 'Failed to like comment. Try again.');
    },
  })

  const createComment = (postId: string) => {
    if (!commentText.trim()) {
      Alert.alert('Empty Comment', 'Please write something before posting!');
      return;
    }

    createCommentMutation.mutate({ postId, content: commentText.trim() });
  };


  const checkIsLiked = (commentId: string) => {
    const likes = commentApi.likeComment(api, commentId);
    return likes;
  };

  return {
    commentText,
    setCommentText,
    createComment,
    isCreatingComment: createCommentMutation.isPending,
    createCommentLike: (commentId: string) => LikeMutation.mutate(commentId),
    checkIsLiked
    
  };
};
