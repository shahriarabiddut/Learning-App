"use client";

import { useFetchCategoriesQuery } from "@/lib/redux-features/categories/categoriesApi";
import { Building } from "lucide-react";
import { FaBuildingCircleCheck } from "react-icons/fa6";
import {
  BaseSelectComponent,
  BaseSelectProps,
  SelectedInfo,
  THEME_CONFIGS,
  commonQueryOptions,
  useSelectLogic,
} from "./BaseSelectComponent";

interface Category {
  id: string;
  name: string;
}

interface SelectCategoryProps extends BaseSelectProps {
  searchQuery?: string;
}

export const SelectCategory = ({
  searchQuery = "",
  ...props
}: SelectCategoryProps) => {
  const queryState = useFetchCategoriesQuery(
    {
      page: 1,
      limit: 100,
      search: searchQuery || undefined,
    },
    commonQueryOptions
  );

  const state = {
    data: queryState.data?.data,
    isLoading: queryState.isLoading,
    isFetching: queryState.isFetching,
    error: queryState.error,
    refetch: queryState.refetch,
  };

  const { options, selectedItem } = useSelectLogic(
    state.data,
    props.value,
    props.filterdId,
    true
  );

  const selectedInfo = selectedItem ? (
    <SelectedInfo
      label="Selected"
      value={selectedItem.name}
      theme={THEME_CONFIGS.category}
    />
  ) : null;

  return (
    <BaseSelectComponent
      {...props}
      options={options}
      state={state}
      icon={
        selectedItem ? (
          <FaBuildingCircleCheck className="w-5 h-5" />
        ) : (
          <Building className="w-5 h-5" />
        )
      }
      theme={THEME_CONFIGS.category}
      title={props.title || (!props.filterdId ? "Category" : "Parent Category")}
      loadingMessage="Updating categories..."
      selectedInfo={selectedInfo}
    />
  );
};
